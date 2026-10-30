import type { NextRequest } from "next/server";
import { assertNoDbError, errorResponse, handleError, json } from "@/lib/api-server";
import type { LessonResponse } from "@/lib/api-types";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { lessonDaySchema } from "@/lib/validation";

/**
 * GET /api/lessons/[day]
 * Lección completa del día indicado (1–30).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/lessons/[day]">) {
  try {
    const { day: rawDay } = await ctx.params;
    const parsed = lessonDaySchema.safeParse(rawDay);
    if (!parsed.success) {
      return errorResponse(422, "validation_error", parsed.error.issues[0]?.message ?? "Día no válido.");
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("lessons").select("*").eq("day", parsed.data).maybeSingle();
    assertNoDbError(error, "leer lección");
    if (!data) return errorResponse(404, "not_found", `No existe la lección del día ${parsed.data}.`);

    return json<LessonResponse>({ lesson: data });
  } catch (err) {
    return handleError(err, "GET /api/lessons/[day]");
  }
}
