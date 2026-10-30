"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { ApiError, api, queryKeys } from "@/lib/api-client";
import type { AuthUser, LoginResponse, SignupResponse, UserStats } from "@/lib/api-types";
import type { LoginInput, SignupInput } from "@/lib/validation";

// -----------------------------------------------------------------------------
// TanStack Query
// -----------------------------------------------------------------------------

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          // No reintentar errores del cliente (401, 403, 404, 422…).
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

function getQueryClient() {
  // Aislado por petición en el servidor; compartido en el navegador.
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

// -----------------------------------------------------------------------------
// AuthContext: sesión del usuario
// -----------------------------------------------------------------------------

export type AuthContextValue = {
  user: AuthUser | null;
  /** true mientras se restaura la sesión al cargar la app. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<LoginResponse>;
  signup: (input: SignupInput) => Promise<SignupResponse>;
  logout: () => Promise<void>;
  /** Vuelve a pedir el perfil al servidor (p. ej. tras editarlo). */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const me = useQuery({
    queryKey: queryKeys.me,
    queryFn: api.auth.me,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, { user: data.user });
    },
  });

  const signupMutation = useMutation({
    mutationFn: api.auth.signup,
    onSuccess: (data) => {
      if (data.user) queryClient.setQueryData(queryKeys.me, { user: data.user });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      // Aunque falle la red, limpiamos todo lo cacheado del usuario.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
      queryClient.setQueryData(queryKeys.me, { user: null });
    },
  });

  const { mutateAsync: loginAsync } = loginMutation;
  const { mutateAsync: signupAsync } = signupMutation;
  const { mutateAsync: logoutAsync } = logoutMutation;
  const { refetch } = me;

  const logout = useCallback(async () => {
    await logoutAsync();
  }, [logoutAsync]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const user = me.data?.user ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: me.isPending,
      isAuthenticated: user !== null,
      login: loginAsync,
      signup: signupAsync,
      logout,
      refresh,
    }),
    [user, me.isPending, loginAsync, signupAsync, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <Providers>.");
  return ctx;
}

// -----------------------------------------------------------------------------
// UserContext: datos y estadísticas del usuario autenticado
// -----------------------------------------------------------------------------

export type UserContextValue = {
  user: AuthUser | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: ApiError | null;
  refetchStats: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthContext();

  const statsQuery = useQuery({
    queryKey: queryKeys.stats,
    queryFn: api.user.stats,
    enabled: user !== null,
    select: (data) => data.stats,
  });

  const { refetch } = statsQuery;
  const refetchStats = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      stats: user ? (statsQuery.data ?? null) : null,
      isLoading: authLoading || (user !== null && statsQuery.isPending),
      error: statsQuery.error instanceof ApiError ? statsQuery.error : null,
      refetchStats,
    }),
    [user, authLoading, statsQuery.data, statsQuery.isPending, statsQuery.error, refetchStats],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <Providers>.");
  return ctx;
}

// -----------------------------------------------------------------------------
// Providers raíz
// -----------------------------------------------------------------------------

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>{children}</UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
