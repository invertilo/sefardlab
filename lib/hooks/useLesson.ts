"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { ApiError, api, queryKeys } from "@/lib/api-client";
import type { LessonRow } from "@/lib/database.types";

/** Opciones compartidas por `useLesson` y `useProgress().getLesson` (misma caché). */
export function lessonQueryOptions(day: number) {
  return queryOptions({
    queryKey: queryKeys.lesson(day),
    queryFn: () => api.lessons.byDay(day),
    select: (data) => data.lesson,
    // El contenido de las lecciones casi nunca cambia.
    staleTime: 60 * 60_000,
  });
}

export type UseLessonResult = {
  lesson: LessonRow | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
};

/**
 * Lección completa de un día (`GET /api/lessons/[day]`).
 *
 * ```tsx
 * const { lesson, isLoading, error } = useLesson(3);
 * ```
 */
export function useLesson(day: number, { enabled = true }: { enabled?: boolean } = {}): UseLessonResult {
  const query = useQuery({ ...lessonQueryOptions(day), enabled });
  const { refetch } = query;
  return {
    lesson: query.data ?? null,
    isLoading: enabled && query.isPending,
    error: query.error instanceof ApiError ? query.error : query.error ? new ApiError(0, "server_error", query.error.message) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
