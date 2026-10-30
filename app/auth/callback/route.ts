import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * GET /auth/callback?code=...&next=/dashboard
 * Destino de OAuth (Google) y de los enlaces de confirmación por correo (PKCE).
 * Intercambia el código por una sesión (cookies) y redirige.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
      console.error("[auth] callback:", error.code, error.message);
    } catch (err) {
      console.error("[auth] callback:", err);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
