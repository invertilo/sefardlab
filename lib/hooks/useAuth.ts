"use client";

import { useAuthContext, type AuthContextValue } from "@/app/providers";

/**
 * Sesión del usuario.
 *
 * ```tsx
 * const { user, isLoading, isAuthenticated, login, signup, logout } = useAuth();
 * ```
 *
 * `login`/`signup` lanzan `ApiError` (con `fields` por campo) si fallan.
 */
export function useAuth(): AuthContextValue {
  return useAuthContext();
}
