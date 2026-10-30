import { handleError, json } from "@/lib/api-server";
import type { LogoutResponse } from "@/lib/api-types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * POST /api/auth/logout
 * Revoca la sesión en Supabase y borra las cookies. Idempotente: responde 200
 * aunque no hubiera sesión.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error && error.status !== 401 && error.status !== 403) {
      // El token ya podía estar caducado; aun así se borran las cookies locales.
      console.warn("[api] logout:", error.code, error.message);
    }
    return json<LogoutResponse>({ ok: true });
  } catch (err) {
    return handleError(err, "POST /api/auth/logout");
  }
}
