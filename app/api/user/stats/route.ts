import { assertNoDbError, handleError, json, requireUser } from "@/lib/api-server";
import type { UserStats, UserStatsResponse, WeekStats } from "@/lib/api-types";
import { getOrCreateProfile } from "@/lib/profile";

const TOTAL_DAYS = 30;

/**
 * GET /api/user/stats
 * Estadísticas agregadas del usuario autenticado.
 */
export async function GET() {
  try {
    const { supabase, user } = await requireUser();

    const [profile, progress, lessons, achievements] = await Promise.all([
      getOrCreateProfile(supabase, user),
      supabase.from("progress").select("lesson_id, accuracy, reading_speed").eq("user_id", user.id),
      supabase.from("lessons").select("id, day, week").order("day"),
      supabase.from("achievements").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    assertNoDbError(progress.error, "stats: progreso");
    assertNoDbError(lessons.error, "stats: lecciones");
    assertNoDbError(achievements.error, "stats: logros");

    const rows = progress.data ?? [];
    const allLessons = lessons.data ?? [];
    const totalLessons = allLessons.length || TOTAL_DAYS;
    const completedIds = new Set(rows.map((r) => r.lesson_id));

    const accuracies = rows.map((r) => r.accuracy).filter((n): n is number => typeof n === "number");
    const speeds = rows.map((r) => r.reading_speed).filter((n): n is number => typeof n === "number" && n > 0);

    const nextLesson = allLessons.find((l) => !completedIds.has(l.id));
    const currentDay = nextLesson?.day ?? totalLessons + 1;
    const currentWeek = nextLesson?.week ?? 4;

    const weeks: WeekStats[] = [1, 2, 3, 4].map((week) => {
      const inWeek = allLessons.filter((l) => l.week === week);
      return { week, total: inWeek.length, completed: inWeek.filter((l) => completedIds.has(l.id)).length };
    });

    const stats: UserStats = {
      xpTotal: profile.xp_total,
      streak: effectiveStreak(profile.streak, profile.last_activity),
      lessonsCompleted: completedIds.size,
      totalLessons,
      completionRate: round2(completedIds.size / totalLessons),
      currentDay,
      currentWeek,
      averageAccuracy: accuracies.length ? round2(avg(accuracies)) : null,
      averageReadingSpeed: speeds.length ? Math.round(avg(speeds)) : null,
      bestReadingSpeed: speeds.length ? Math.max(...speeds) : null,
      achievementsUnlocked: achievements.count ?? 0,
      lastActivity: profile.last_activity,
      weeks,
    };

    return json<UserStatsResponse>({ stats });
  } catch (err) {
    return handleError(err, "GET /api/user/stats");
  }
}

/** La racha guardada solo sigue viva si hubo actividad hoy o ayer (UTC). */
function effectiveStreak(streak: number, lastActivity: string | null): number {
  if (!lastActivity) return 0;
  const dayMs = 86_400_000;
  const lastDay = Math.floor(new Date(lastActivity).getTime() / dayMs);
  const today = Math.floor(Date.now() / dayMs);
  return today - lastDay <= 1 ? streak : 0;
}

function avg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
