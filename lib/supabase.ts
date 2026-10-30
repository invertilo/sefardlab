/**
 * Cliente Supabase para el navegador + utilidades de configuración.
 *
 * - En componentes cliente: `getSupabaseBrowserClient()`.
 * - En Route Handlers / Server Components: `createSupabaseServerClient()` de
 *   `@/lib/supabase-server` (lee y escribe las cookies de sesión).
 *
 * La sesión vive en cookies gestionadas por `@supabase/ssr`, de modo que
 * servidor y navegador comparten la misma sesión.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type * from "./database.types";
export type TypedSupabaseClient = SupabaseClient<Database>;

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase no está configurado. Copia .env.local.example a .env.local y rellena " +
        "NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (ver SUPABASE_SETUP.md).",
    );
    this.name = "SupabaseConfigError";
  }
}

/**
 * Lee las variables públicas. Deben referenciarse literalmente
 * (`process.env.NEXT_PUBLIC_...`) para que Next.js las incruste en el bundle.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseConfigError();
  return env;
}

let browserClient: TypedSupabaseClient | undefined;

/** Cliente singleton para el navegador. No usar en el servidor. */
export function getSupabaseBrowserClient(): TypedSupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient() solo puede usarse en el navegador.");
  }
  if (!browserClient) {
    const { url, anonKey } = requireSupabaseEnv();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
