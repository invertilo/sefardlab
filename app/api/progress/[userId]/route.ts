import type { NextRequest } from "next/server";
import { assertNoDbError, handleError, HttpError, json, parseBody, requireUser } from "@/lib/api-server";
import type { ProgressEntry, ProgressResponse, SaveProgressResponse } from "@/lib/api-types";
import type { ProgressRow } from "@/lib/database.types";
import type { TypedSupabaseClient } from "@/lib/supabase";
import { saveProgressSchema } from "@/lib/validation";

type Ctx = RouteContext<"/api/progress/[userId]">;

/** `userId` puede ser el UUID del usuario o el alias `me`. Solo el propio. */
async function authorize(ctx: Ctx) {
  const { userId } = await ctx.params;
  const auth = await requireUser();
  if (userId !== "me" && userId !== auth.user.id) {
    throw new HttpError(403, "forbidden", "Solo puedes acceder a tu propio progreso.");
  }
  return auth;
}

/**
 * GET /api/progress/[userId]
 * Lecciones completadas por el usuario, ordenadas por día.
 */
export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    const { supabase, user } = await authorize(ctx);
    const { data, error } = await supabase
      .from("progress")
      .select("*, lesson:lessons(day, week, title, word_count)")
      .eq("user_id", user.id)
      .order("lesson_id", { ascending: true });
    assertNoDbError(error, "leer progreso");

    return json<ProgressResponse>({ progress: (data ?? []) as ProgressEntry[] });
  } catch (err) {
    return handleError(err, "GET /api/progress/[userId]");
  }
}

/**
 * POST /api/progress/[userId]
 * Body: { lesson_id, accuracy (0–1), reading_speed? (ppm) }
 * Guarda el resultado de una lección. La primera vez suma XP y actualiza la
 * racha (triggers en la BD); si se repite, conserva la mejor marca y suma
 * un repaso (palabras leídas). Las insignias las desbloquea la BD.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { supabase, user } = await authorize(ctx);
    const input = await parseBody(request, saveProgressSchema);
    const accuracy = Math.round(input.accuracy * 100) / 100;
    const readingSpeed = input.reading_speed ?? null;

    const lesson = await supabase.from("lessons").select("id").eq("id", input.lesson_id).maybeSingle();
    assertNoDbError(lesson.error, "comprobar lección");
    if (!lesson.data) throw new HttpError(404, "not_found", `No existe la lección ${input.lesson_id}.`);

    let firstCompletion = false;
    let row = await findProgress(supabase, user.id, input.lesson_id);

    if (!row) {
      const inserted = await supabase
        .from("progress")
        .insert({ user_id: user.id, lesson_id: input.lesson_id, accuracy, reading_speed: readingSpeed })
        .select("*")
        .single();
      if (inserted.error?.code === "23505") {
        // Otra petición la insertó a la vez: seguimos por la rama de actualización.
        row = await findProgress(supabase, user.id, input.lesson_id);
      } else {
        assertNoDbError(inserted.error, "guardar progreso");
        row = inserted.data;
        firstCompletion = true;
      }
    }

    if (!row) throw new HttpError(500, "server_error", "No pudimos guardar el progreso.");

    if (!firstCompletion) {
      // Siempre se actualiza (aunque no mejore la marca): el trigger
      // `progress_track_attempt` cuenta el repaso para las palabras leídas y
      // `progress_unlock_achievements` revisa las insignias.
      const best = {
        accuracy: Math.max(row.accuracy ?? 0, accuracy),
        reading_speed:
          readingSpeed === null ? row.reading_speed : Math.max(row.reading_speed ?? 0, readingSpeed),
      };
      const updated = await supabase
        .from("progress")
        .update(best)
        .eq("id", row.id)
        .select("*")
        .single();
      assertNoDbError(updated.error, "mejorar progreso");
      row = updated.data ?? row;
    }

    const profile = await supabase
      .from("users")
      .select("xp_total, streak, last_activity")
      .eq("id", user.id)
      .single();
    assertNoDbError(profile.error, "leer XP");
    if (!profile.data) throw new HttpError(500, "server_error", "No pudimos leer tu XP.");

    return json<SaveProgressResponse>(
      {
        progress: row,
        xpAwarded: firstCompletion ? row.xp_earned : 0,
        firstCompletion,
        user: profile.data,
      },
      firstCompletion ? 201 : 200,
    );
  } catch (err) {
    return handleError(err, "POST /api/progress/[userId]");
  }
}

async function findProgress(
  supabase: TypedSupabaseClient,
  userId: string,
  lessonId: number,
): Promise<ProgressRow | null> {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  assertNoDbError(error, "buscar progreso");
  return data;
}
