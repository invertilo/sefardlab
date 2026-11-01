"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { AchievementId } from "@/lib/achievements";
import { ApiError, api, queryKeys } from "@/lib/api-client";
import type { LessonResult, MeResponse, ProgressEntry, SaveProgressResponse } from "@/lib/api-types";
import type { LessonRow } from "@/lib/database.types";
import {
  activeDays,
  activityLastDays,
  calculateLessonXp,
  effectiveStreak,
  nextStreak,
  xpInLastDays,
  type ActivityDay,
  type XpBreakdown,
} from "@/lib/gamification";
import type { SaveProgressInput } from "@/lib/validation";
import { useAuth } from "./useAuth";
import { lessonQueryOptions } from "./useLesson";
import { useUser } from "./useUser";

export type WeeklyStats = {
  /** XP de los últimos 7 días (UTC, incluido hoy). */
  xp: number;
  /** Lecciones nuevas completadas en los últimos 7 días. */
  lessons: number;
  /** Días con actividad en los últimos 7 días. */
  activeDays: number;
  activity: ActivityDay[];
};

export type UseProgressResult = {
  progress: ProgressEntry[];
  /** IDs de lecciones completadas, para comprobaciones rápidas. */
  completedLessonIds: Set<number>;
  isCompleted: (lessonId: number) => boolean;
  isLoading: boolean;
  error: ApiError | null;
  /** Guarda el resultado de una lección e invalida stats/perfil. */
  saveResult: (input: SaveProgressInput) => Promise<SaveProgressResponse>;
  isSaving: boolean;
  saveError: ApiError | null;
  /**
   * Obtiene (o lee de caché) la lección de un día. Comparte caché con
   * `useLesson`, así que sirve también para precargar la siguiente lección.
   */
  getLesson: (day: number) => Promise<LessonRow>;

  // --- Gamificación (derivado del progreso, el perfil y /api/user/stats) ---
  /** XP total del perfil (o suma de las lecciones si aún no cargó). */
  xpTotal: number;
  /** Racha vigente (0 si no hubo actividad hoy ni ayer, UTC). */
  streak: number;
  /** Palabras hebreas leídas, contando repasos. */
  wordsRead: number;
  /** Días distintos con lecciones completadas. */
  daysActive: number;
  /** Insignias desbloqueadas por la BD. */
  unlockedAchievements: AchievementId[];
  weeklyStats: WeeklyStats;
  /** XP estimada de completar ahora una lección nueva (incluye bonus de racha). */
  estimateXp: (result: Pick<LessonResult, "accuracy" | "readingSpeed">) => XpBreakdown;
};

const EMPTY_WEEK: WeeklyStats = { xp: 0, lessons: 0, activeDays: 0, activity: [] };

/**
 * Progreso del usuario autenticado (`/api/progress/me`).
 *
 * ```tsx
 * const { isCompleted, saveResult } = useProgress();
 * await saveResult({ lesson_id: 3, accuracy: 0.9, reading_speed: 18 });
 * ```
 */
export function useProgress(): UseProgressResult {
  const { user } = useAuth();
  const { stats } = useUser();
  const queryClient = useQueryClient();
  const key = queryKeys.progress(user?.id ?? "anon");

  const query = useQuery({
    queryKey: key,
    queryFn: () => api.progress.get("me"),
    enabled: user !== null,
    select: (data) => data.progress,
  });

  const mutation = useMutation({
    mutationFn: (input: SaveProgressInput) => api.progress.save(input, "me"),
    onSuccess: (data) => {
      // Refleja la XP/racha nueva al instante en el perfil cacheado.
      queryClient.setQueryData<MeResponse>(queryKeys.me, (prev) =>
        prev?.user ? { user: { ...prev.user, ...data.user } } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });

  const progress = useMemo(() => query.data ?? [], [query.data]);
  const completedLessonIds = useMemo(() => new Set(progress.map((p) => p.lesson_id)), [progress]);

  const getLesson = useCallback(
    async (day: number) => {
      const { queryKey, queryFn, staleTime } = lessonQueryOptions(day);
      const data = await queryClient.fetchQuery({ queryKey, queryFn, staleTime });
      return data.lesson;
    },
    [queryClient],
  );

  const gamification = useMemo(() => {
    const xpFromLessons = progress.reduce((sum, p) => sum + p.xp_earned, 0);
    const wordsRead = progress.reduce((sum, p) => sum + (p.lesson?.word_count ?? 0) * p.attempts, 0);
    // Referencia temporal = momento de la última carga del progreso (pura,
    // sin leer el reloj en el render). 0 → aún no hay datos.
    const now = query.dataUpdatedAt;
    if (!user || now === 0) {
      return { xpTotal: user?.xp_total ?? 0, streak: 0, wordsRead, daysActive: 0, weeklyStats: EMPTY_WEEK };
    }
    const activity = activityLastDays(progress, 7, now);
    return {
      xpTotal: Math.max(user.xp_total, xpFromLessons),
      streak: effectiveStreak(user.streak, user.last_activity, now),
      wordsRead,
      daysActive: activeDays(progress),
      weeklyStats: {
        xp: xpInLastDays(progress, 7, now),
        lessons: activity.reduce((n, d) => n + d.lessons, 0),
        activeDays: activity.filter((d) => d.lessons > 0).length,
        activity,
      },
    };
  }, [progress, user, query.dataUpdatedAt]);

  const estimateXp = useCallback(
    (result: Pick<LessonResult, "accuracy" | "readingSpeed">) =>
      calculateLessonXp({
        accuracy: result.accuracy,
        readingSpeed: result.readingSpeed,
        // Se llama desde handlers (no en render): leer el reloj aquí es seguro.
        streak: user ? nextStreak(user.streak, user.last_activity, Date.now()) : undefined,
      }),
    [user],
  );

  return {
    ...gamification,
    unlockedAchievements: stats?.achievements ?? [],
    estimateXp,
    progress,
    completedLessonIds,
    isCompleted: (lessonId) => completedLessonIds.has(lessonId),
    isLoading: user !== null && query.isPending,
    error: query.error instanceof ApiError ? query.error : null,
    saveResult: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error instanceof ApiError ? mutation.error : null,
    getLesson,
  };
}
