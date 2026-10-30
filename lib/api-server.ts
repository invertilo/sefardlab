/**
 * Utilidades para Route Handlers: respuestas de error uniformes, lectura y
 * validación del cuerpo, y obtención del usuario autenticado.
 */
import type { AuthError, PostgrestError, User } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import type { z } from "zod";
import type { ApiErrorBody, ApiErrorCode } from "./api-types";
import { SupabaseConfigError, type TypedSupabaseClient } from "./supabase";
import { createSupabaseServerClient } from "./supabase-server";
import { fieldErrors } from "./validation";

/** Error que un handler puede lanzar para cortar con una respuesta concreta. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const NO_STORE = { "Cache-Control": "private, no-store" };

export function json<T>(body: T, status = 200): NextResponse<T> {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
): NextResponse<ApiErrorBody> {
  return json<ApiErrorBody>({ error: { code, message, ...(fields ? { fields } : {}) } }, status);
}

/** Convierte cualquier excepción en una respuesta JSON segura. */
export function handleError(err: unknown, context: string): NextResponse<ApiErrorBody> {
  // Deja pasar las señales internas de Next.js (prerender, redirect, notFound…).
  unstable_rethrow(err);
  if (err instanceof HttpError) {
    return errorResponse(err.status, err.code, err.message, err.fields);
  }
  if (err instanceof SupabaseConfigError) {
    return errorResponse(503, "not_configured", err.message);
  }
  console.error(`[api] ${context}:`, err);
  return errorResponse(500, "server_error", "Algo salió mal. Inténtalo de nuevo en unos segundos.");
}

/** Lee el JSON del cuerpo y lo valida con un esquema zod. */
export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "invalid_json", "El cuerpo de la petición debe ser JSON válido.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error);
    const first = Object.values(fields)[0] ?? "Datos no válidos.";
    throw new HttpError(422, "validation_error", first, fields);
  }
  return parsed.data;
}

/** Devuelve el cliente de la petición y el usuario autenticado, o lanza 401. */
export async function requireUser(): Promise<{ supabase: TypedSupabaseClient; user: User }> {
  const supabase = await createSupabaseServerClient();
  // getUser() valida el JWT contra Supabase Auth (no confía solo en la cookie).
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new HttpError(401, "unauthorized", "Inicia sesión para continuar.");
  }
  return { supabase, user: data.user };
}

/** Traduce errores de Supabase Auth a errores HTTP con mensaje en español. */
export function authErrorToHttp(error: AuthError): HttpError {
  switch (error.code) {
    case "invalid_credentials":
      return new HttpError(401, "invalid_credentials", "Correo o contraseña incorrectos.");
    case "email_not_confirmed":
      return new HttpError(
        403,
        "email_not_confirmed",
        "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada.",
      );
    case "user_already_exists":
    case "email_exists":
      return new HttpError(409, "email_taken", "Ya existe una cuenta con ese correo.", {
        email: "Ya existe una cuenta con ese correo.",
      });
    case "weak_password":
      return new HttpError(422, "weak_password", "La contraseña es demasiado débil. Prueba con otra más larga.", {
        password: "La contraseña es demasiado débil.",
      });
    case "email_address_invalid":
      return new HttpError(422, "validation_error", "Ese correo no parece válido.", {
        email: "Ese correo no parece válido.",
      });
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return new HttpError(429, "rate_limited", "Demasiados intentos. Espera un momento y vuelve a probar.");
    case "signup_disabled":
      return new HttpError(403, "forbidden", "El registro está desactivado temporalmente.");
    default:
      if (error.status === 429) {
        return new HttpError(429, "rate_limited", "Demasiados intentos. Espera un momento y vuelve a probar.");
      }
      console.error("[api] Supabase Auth:", error.code, error.message);
      return new HttpError(500, "server_error", "No pudimos completar la operación. Inténtalo de nuevo.");
  }
}

/** Lanza un 500 genérico (y registra el detalle) si hay error de PostgREST. */
export function assertNoDbError(error: PostgrestError | null, context: string): void {
  if (error) {
    console.error(`[db] ${context}:`, error.code, error.message, error.details);
    throw new HttpError(500, "server_error", "Error al acceder a la base de datos.");
  }
}
