/**
 * Clientes Supabase para el servidor (Route Handlers, Server Components).
 * Importa `next/headers`, así que no puede usarse desde componentes cliente.
 */
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { requireSupabaseEnv, type TypedSupabaseClient } from "./supabase";

/**
 * Cliente ligado a la petición: lee la sesión de las cookies y escribe las
 * cookies nuevas (login, refresh, logout). Crear uno nuevo por petición.
 */
export async function createSupabaseServerClient(): Promise<TypedSupabaseClient> {
  // cookies() primero: marca la ruta como dinámica antes de validar el entorno,
  // así nunca se prerenderiza una respuesta de error en el build.
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component (cookies de solo lectura).
          // El proxy (`proxy.ts`) se encarga de refrescar la sesión.
        }
      },
    },
  });
}

/**
 * Cliente con service role: salta RLS. Solo para scripts y tareas de
 * administración en el servidor. Nunca exponer la clave al navegador.
 */
export function createSupabaseAdminClient(): TypedSupabaseClient {
  const { url } = requireSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
