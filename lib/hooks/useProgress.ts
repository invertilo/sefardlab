"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { ApiError, api, queryKeys } from "@/lib/api-client";
import type { MeResponse, ProgressEntry, SaveProgressResponse } from "@/lib/api-types";
import type { LessonRow } from "@/lib/database.types";
import type { SaveProgressInput } from "@/lib/validation";
import { useAuth } from "./useAuth";
import { lessonQueryOptions } from "./useLesson";

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
};

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

  return {
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
