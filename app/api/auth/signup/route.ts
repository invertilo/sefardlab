import type { UserPreferences } from "@/lib/database.types";
import { authErrorToHttp, handleError, HttpError, json, parseBody } from "@/lib/api-server";
import type { SignupResponse } from "@/lib/api-types";
import { getOrCreateProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { signupSchema } from "@/lib/validation";

/**
 * POST /api/auth/signup
 * Body: { name, email, password, goal?, level? }
 * Crea el usuario en Supabase Auth y su perfil en `public.users`.
 * Si el proyecto no exige confirmar el correo, deja la sesión iniciada (cookies).
 */
export async function POST(request: Request) {
  try {
    const { name, email, password, goal, level } = await parseBody(request, signupSchema);
    const supabase = await createSupabaseServerClient();

    const preferences: Partial<UserPreferences> = {
      ...(goal ? { dailyGoal: goal } : {}),
      ...(level ? { level } : {}),
    };

    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // El trigger `handle_new_user` lee estos metadatos para crear el perfil.
        data: { name, preferences },
        // El enlace del correo de confirmación vuelve a /auth/callback (PKCE).
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) throw authErrorToHttp(error);

    // Con confirmación de email activa, Supabase no revela si el correo ya
    // existía: devuelve un usuario sin identidades y sin sesión.
    if (data.user && data.user.identities?.length === 0) {
      throw new HttpError(409, "email_taken", "Ya existe una cuenta con ese correo.", {
        email: "Ya existe una cuenta con ese correo.",
      });
    }
    if (!data.user) {
      throw new HttpError(500, "server_error", "No pudimos crear la cuenta. Inténtalo de nuevo.");
    }

    if (!data.session) {
      return json<SignupResponse>({ user: null, session: null, needsEmailConfirmation: true }, 201);
    }

    const profile = await getOrCreateProfile(supabase, data.user);
    return json<SignupResponse>(
      {
        user: profile,
        session: { access_token: data.session.access_token, expires_at: data.session.expires_at ?? null },
        needsEmailConfirmation: false,
      },
      201,
    );
  } catch (err) {
    return handleError(err, "POST /api/auth/signup");
  }
}
