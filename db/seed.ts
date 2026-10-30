/**
 * Inserta (o actualiza) las 30 lecciones de `db/seed.json` en Supabase.
 *
 *   npm run db:seed              → upsert vía API con SUPABASE_SERVICE_ROLE_KEY
 *   npm run db:seed -- --check   → solo valida seed.json (no necesita credenciales)
 *   npm run db:seed -- --sql     → imprime SQL para pegar en el SQL Editor
 *
 * Lee las variables de `.env.local` (o del entorno). Es idempotente: puedes
 * ejecutarlo tantas veces como quieras.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, TablesInsert } from "../lib/database.types";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// --- Esquema de validación (refleja lib/database.types.ts) --------------------

const contentBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), data: z.string().min(1) }),
  z.object({
    type: z.literal("hebrew"),
    data: z.string().min(1),
    transliteration: z.string().optional(),
    translation: z.string().optional(),
  }),
  z.object({ type: z.literal("tip"), data: z.string().min(1) }),
  z.object({
    type: z.literal("image"),
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }),
]);

const exercise = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("multiple_choice"),
      question: z.string().min(1),
      prompt: z.string().optional(),
      options: z.array(z.string().min(1)).min(2).max(6),
      correct: z.number().int().min(0),
    })
    .refine((e) => e.correct < e.options.length, "`correct` fuera de rango")
    .refine((e) => new Set(e.options).size === e.options.length, "opciones duplicadas"),
  z.object({
    type: z.literal("reading"),
    question: z.string().min(1),
    text: z.string().min(1),
    transliteration: z.string().min(1),
    translation: z.string().min(1),
    word_count: z.number().int().positive(),
  }),
]);

const lessonSchema = z
  .object({
    id: z.number().int().min(1).max(30),
    day: z.number().int().min(1).max(30),
    week: z.number().int().min(1).max(4),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    content: z.array(contentBlock).min(1),
    exercises: z.array(exercise).min(1),
    min_reading_speed: z.number().int().min(0).default(0),
  })
  .strict();

const seedSchema = z
  .array(lessonSchema)
  .length(30, "Deben ser exactamente 30 lecciones")
  .refine((ls) => new Set(ls.map((l) => l.id)).size === 30, "ids duplicados")
  .refine((ls) => new Set(ls.map((l) => l.day)).size === 30, "días duplicados");

// --- Utilidades ---------------------------------------------------------------

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const [, key, raw] = m;
    const value = raw.replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `'${text.replace(/'/g, "''")}'`;
}

function toSql(lessons: TablesInsert<"lessons">[]): string {
  const rows = lessons.map(
    (l) =>
      `  (${l.id}, ${l.day}, ${l.week}, ${sqlLiteral(l.title)}, ${sqlLiteral(l.description ?? null)}, ` +
      `${sqlLiteral(l.content)}::jsonb, ${sqlLiteral(l.exercises)}::jsonb, ${l.min_reading_speed ?? 0})`,
  );
  return [
    "-- Generado por db/seed.ts --sql",
    "INSERT INTO public.lessons (id, day, week, title, description, content, exercises, min_reading_speed) VALUES",
    rows.join(",\n"),
    "ON CONFLICT (id) DO UPDATE SET",
    "  day = EXCLUDED.day, week = EXCLUDED.week, title = EXCLUDED.title,",
    "  description = EXCLUDED.description, content = EXCLUDED.content,",
    "  exercises = EXCLUDED.exercises, min_reading_speed = EXCLUDED.min_reading_speed;",
    "",
  ].join("\n");
}

// --- Main ---------------------------------------------------------------------

async function main() {
  const args = new Set(process.argv.slice(2));
  const raw: unknown = JSON.parse(readFileSync(resolve(here, "seed.json"), "utf8"));

  const parsed = seedSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("✗ seed.json no es válido:");
    for (const issue of parsed.error.issues) console.error(`  - [${issue.path.join(".")}] ${issue.message}`);
    process.exit(1);
  }
  const lessons: TablesInsert<"lessons">[] = parsed.data
    .map((l) => ({ ...l, description: l.description ?? null }))
    .sort((a, b) => a.day - b.day);

  if (args.has("--check")) {
    console.log(`✓ seed.json válido: ${lessons.length} lecciones.`);
    return;
  }
  if (args.has("--sql")) {
    process.stdout.write(toSql(lessons));
    return;
  }

  loadEnvFile(resolve(root, ".env.local"));
  loadEnvFile(resolve(root, ".env"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error(
      "✗ Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n" +
        "  Alternativa sin service key: npm run db:seed -- --sql > db/seed.sql y pégalo en el SQL Editor.",
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("lessons").upsert(lessons, { onConflict: "id" });
  if (error) {
    console.error("✗ Error al insertar lecciones:", error.message);
    if (error.code === "42P01" || /relation .* does not exist/i.test(error.message)) {
      console.error("  ¿Ejecutaste db/migrations/001_init.sql en el SQL Editor?");
    }
    process.exit(1);
  }

  const { count, error: countError } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true });
  if (countError) {
    console.error("✗ Lecciones insertadas, pero no se pudo verificar el total:", countError.message);
    process.exit(1);
  }
  console.log(`✓ ${lessons.length} lecciones sincronizadas. Total en la base de datos: ${count}.`);
}

main().catch((err: unknown) => {
  console.error("✗ Error inesperado:", err);
  process.exit(1);
});
