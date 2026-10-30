/**
 * Esquemas de validación compartidos por los formularios (cliente) y las APIs
 * (servidor). Mensajes en español, listos para mostrar al usuario.
 */
import { z } from "zod";

const email = z
  .string({ error: "Escribe tu correo electrónico." })
  .trim()
  .toLowerCase()
  .min(1, "Escribe tu correo electrónico.")
  .max(254, "El correo es demasiado largo.")
  .pipe(z.email("Ese correo no parece válido."));

export const signupSchema = z.object({
  name: z
    .string({ error: "Escribe tu nombre." })
    .trim()
    .min(1, "Escribe tu nombre.")
    .max(80, "El nombre puede tener como máximo 80 caracteres."),
  email,
  password: z
    .string({ error: "Escribe una contraseña." })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña puede tener como máximo 72 caracteres."),
  goal: z.coerce
    .number()
    .refine((n): n is 5 | 10 | 15 | 20 => [5, 10, 15, 20].includes(n), "Meta diaria no válida.")
    .optional(),
  level: z.enum(["none", "some", "most"], { error: "Elige tu nivel." }).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Escribe tu contraseña." }).min(1, "Escribe tu contraseña.").max(72),
});

export const saveProgressSchema = z.object({
  lesson_id: z.coerce.number().int().min(1).max(30),
  /** Palabras por minuto medidas en el ejercicio de lectura. */
  reading_speed: z.coerce.number().int().min(0).max(1000).nullish(),
  /** Proporción de aciertos entre 0 y 1. */
  accuracy: z.coerce
    .number()
    .min(0, "La precisión debe estar entre 0 y 1.")
    .max(1, "La precisión debe estar entre 0 y 1."),
});

export const lessonDaySchema = z.coerce
  .number({ error: "El día debe ser un número." })
  .int("El día debe ser un número entero.")
  .min(1, "El día debe estar entre 1 y 30.")
  .max(30, "El día debe estar entre 1 y 30.");

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SaveProgressInput = z.infer<typeof saveProgressSchema>;

/** Convierte un ZodError en `{ campo: "primer mensaje" }`. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
