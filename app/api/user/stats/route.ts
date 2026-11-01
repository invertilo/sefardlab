import { computeAchievementProgress, isAchievementId, type AchievementId } from "@/lib/achievements";
import { assertNoDbError, handleError, json, requireUser } from "@/lib/api-server";
import type { UnlockedAchievement, UserStatsResponse, WeekStats } from "@/lib/api-types";
import {
  activeDays,
  activityLastDays,
  average,
  effectiveStreak,
  wordsRead,
  xpInLastDays,
  type ProgressFact,
} from "@/lib/gamification";
import { TOTAL_DAYS } from "@/lib/lesson";
import { getOrCreateProfile } from "@/lib/profile";

/**
 * GET /api/user/stats
 * Estadísticas y gamificación del usuario autenticado: XP, racha, palabras
 * leídas, insignias (las otorga la BD), progreso del reto y actividad semanal.
 */
export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const now = Date.now();

    const [profile, progress, lessons, achievements] = await Promise.all([
      getOrCreateProfile(supabase, user),
      supabase
        .from("progress")
        .select("lesson_id, accuracy, reading_speed, xp_earned, completed_at, attempts")
        .eq("user_id", user.id),
      supabase.from("lessons").select("id, day, week, title, description, word_count").order("day"),
      supabase
        .from("achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user.id)
        .order("unlocked_at"),
    ]);
    assertNoDbError(progress.error, "stats: progreso");
    assertNoDbError(lessons.error, "stats: lecciones");
    assertNoDbError(achievements.error, "stats: logros");

    const rows: ProgressFact[] = progress.data ?? [];
    const allLessons = lessons.data ?? [];
    const totalLessons = allLessons.length || TOTAL_DAYS;
    const byId = new Map(rows.map((r) => [r.lesson_id, r]));
    const completedIds = new Set(byId.keys());

    const accuracies = rows.map((r) => r.accuracy).filter((n): n is number => typeof n === "number");
    const speeds = rows.map((r) => r.reading_speed).filter((n): n is number => typeof n === "number" && n > 0);
    const avgAccuracy = average(accuracies);
    const avgSpeed = average(speeds);
    const bestSpeed = speeds.length ? Math.max(...speeds) : null;

    const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? null;
    const lastLesson = allLessons.at(-1);
    const currentDay = nextLesson?.day ?? lastLesson?.day ?? TOTAL_DAYS;
    const currentWeek = nextLesson?.week ?? lastLesson?.week ?? 4;

    const weekNumbers = [...new Set(allLessons.map((l) => l.week))].sort((a, b) => a - b);
    const weeks: WeekStats[] = weekNumbers.map((week) => {
      const inWeek = allLessons.filter((l) => l.week === week);
      const done = inWeek.map((l) => byId.get(l.id)).filter((r) => r !== undefined);
      return {
        week,
        total: inWeek.length,
        completed: done.length,
        perfect: done.filter((r) => (r.accuracy ?? 0) >= 1).length,
      };
    });

    const words = wordsRead(rows, new Map(allLessons.map((l) => [l.id, l.word_count])));
    const streak = effectiveStreak(profile.streak, profile.last_activity, now);
    const dayById = new Map(allLessons.map((l) => [l.id, l.day]));
    const completedDays = new Set(rows.map((r) => dayById.get(r.lesson_id)).filter((d) => d !== undefined));

    const unlocked: UnlockedAchievement[] = (achievements.data ?? [])
      .filter((a): a is { achievement_id: AchievementId; unlocked_at: string } => isAchievementId(a.achievement_id))
      .map((a) => ({ id: a.achievement_id, unlocked_at: a.unlocked_at }));

    const stats: UserStatsResponse = {
      xp_total: profile.xp_total,
      streak,
      words_read: words,
      avg_speed: avgSpeed === null ? null : Math.round(avgSpeed),
      best_speed: bestSpeed,
      days_active: activeDays(rows),
      achievements: unlocked.map((a) => a.id),
      achievements_detail: unlocked,
      achievement_progress: computeAchievementProgress({
        completedDays,
        weeks,
        wordsRead: words,
        bestReadingSpeed: bestSpeed ?? 0,
        streak,
      }),
      current_day: currentDay,
      current_week: currentWeek,
      progress_percentage: Math.round((completedIds.size / totalLessons) * 100),
      lessons_completed: completedIds.size,
      total_lessons: totalLessons,
      next_lesson_id: nextLesson?.id ?? null,
      next_lesson: nextLesson
        ? {
            id: nextLesson.id,
            day: nextLesson.day,
            week: nextLesson.week,
            title: nextLesson.title,
            description: nextLesson.description,
          }
        : null,
      challenge_completed: nextLesson === null && completedIds.size > 0,
      weekly_xp: xpInLastDays(rows, 7, now),
      monthly_xp: xpInLastDays(rows, 30, now),
      average_accuracy: avgAccuracy === null ? null : Math.round(avgAccuracy * 100) / 100,
      last_activity: profile.last_activity,
      activity: activityLastDays(rows, 7, now),
      weeks,
    };

    return json<UserStatsResponse>(stats);
  } catch (err) {
    return handleError(err, "GET /api/user/stats");
  }
}
