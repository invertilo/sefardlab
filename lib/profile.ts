/**
 * Acceso al perfil (`public.users`) desde el servidor.
 */
import type { User } from "@supabase/supabase-js";
import { assertNoDbError } from "./api-server";
import type { UserPreferences, UserRow } from "./database.types";
import type { TypedSupabaseClient } from "./supabase";

const DEFAULT_PREFERENCES: UserPreferences = { theme: "system", fontSize: "normal", language: "es" };

/**
 * Devuelve el perfil del usuario. Normalmente lo crea el trigger
 * `on_auth_user_created`; si faltara (p. ej. usuarios anteriores a la
 * migración), lo crea aquí bajo RLS con los metadatos de Auth.
 */
export async function getOrCreateProfile(supabase: TypedSupabaseClient, user: User): Promise<UserRow> {
  const existing = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
  assertNoDbError(existing.error, "leer perfil");
  if (existing.data) return existing.data;

  const meta = (user.user_metadata ?? {}) as { name?: unknown; full_name?: unknown; preferences?: unknown };
  const metaName = typeof meta.name === "string" ? meta.name : typeof meta.full_name === "string" ? meta.full_name : "";
  const metaPrefs =
    meta.preferences && typeof meta.preferences === "object" ? (meta.preferences as Partial<UserPreferences>) : {};

  const email = user.email ?? "";
  const inserted = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email,
        name: metaName.trim() || email.split("@")[0] || "Estudiante",
        preferences: { ...DEFAULT_PREFERENCES, ...metaPrefs },
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();
  assertNoDbError(inserted.error, "crear perfil");
  if (inserted.data) return inserted.data;

  // ignoreDuplicates no devuelve fila si otra petición la creó a la vez.
  const retry = await supabase.from("users").select("*").eq("id", user.id).single();
  assertNoDbError(retry.error, "releer perfil");
  return retry.data as UserRow;
}
