"use client";

import { useUserContext, type UserContextValue } from "@/app/providers";

/**
 * Perfil + estadísticas del usuario autenticado (`GET /api/user/stats`).
 * `stats` es `null` sin sesión o mientras carga.
 *
 * ```tsx
 * const { user, stats, isLoading } = useUser();
 * ```
 */
export function useUser(): UserContextValue {
  return useUserContext();
}
