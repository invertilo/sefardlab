import { authErrorToHttp, handleError, HttpError, json, parseBody } from "@/lib/api-server";
import type { LoginResponse } from "@/lib/api-types";
import { getOrCreateProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { loginSchema } from "@/lib/validation";

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Valida las credenciales con Supabase Auth, guarda la sesión en cookies y
 * devuelve el perfil + el access token.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await parseBody(request, loginSchema);
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw authErrorToHttp(error);
    if (!data.session || !data.user) {
      throw new HttpError(500, "server_error", "No pudimos iniciar la sesión. Inténtalo de nuevo.");
    }

    const profile = await getOrCreateProfile(supabase, data.user);
    return json<LoginResponse>({
      user: profile,
      session: { access_token: data.session.access_token, expires_at: data.session.expires_at ?? null },
    });
  } catch (err) {
    return handleError(err, "POST /api/auth/login");
  }
}
