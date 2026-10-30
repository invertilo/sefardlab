import type { NextRequest } from "next/server";
import { assertNoDbError, errorResponse, handleError, json } from "@/lib/api-server";
import type { LessonsResponse } from "@/lib/api-types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const SUMMARY_COLUMNS = "id, day, week, title, description, min_reading_speed" as const;

/**
 * GET /api/lessons            → resumen de las 30 lecciones (sin contenido)
 * GET /api/lessons?full=1     → lecciones completas (contenido + ejercicios)
 * GET /api/lessons?week=2     → filtra por semana (combinable con full)
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const full = params.get("full") === "1" || params.get("full") === "true";
    const weekParam = params.get("week");
    const week = weekParam === null ? null : Number(weekParam);
    if (week !== null && !(Number.isInteger(week) && week >= 1 && week <= 4)) {
      return errorResponse(422, "validation_error", "La semana debe estar entre 1 y 4.");
    }

    const supabase = await createSupabaseServerClient();
    const base = supabase.from("lessons");
    let query = full ? base.select("*") : base.select(SUMMARY_COLUMNS);
    if (week !== null) query = query.eq("week", week);

    const { data, error } = await query.order("day", { ascending: true });
    assertNoDbError(error, "listar lecciones");
    return json<LessonsResponse>({ lessons: data ?? [] });
  } catch (err) {
    return handleError(err, "GET /api/lessons");
  }
}
