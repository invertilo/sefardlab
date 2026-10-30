import { handleError, HttpError, json, requireUser } from "@/lib/api-server";
import type { MeResponse } from "@/lib/api-types";
import { getOrCreateProfile } from "@/lib/profile";

/**
 * GET /api/auth/me
 * Perfil del usuario de la sesión actual, o `{ user: null }` si no hay sesión.
 * Lo usa el AuthContext para restaurar la sesión al recargar.
 */
export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const profile = await getOrCreateProfile(supabase, user);
    return json<MeResponse>({ user: profile });
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return json<MeResponse>({ user: null });
    }
    return handleError(err, "GET /api/auth/me");
  }
}
