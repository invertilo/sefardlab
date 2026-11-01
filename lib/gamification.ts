/**
 * Reglas de gamificación (XP, racha, palabras, actividad). Funciones puras que
 * comparten el cliente (estimaciones y `useProgress`) y `/api/user/stats`.
 *
 * La autoridad es la base de datos: los triggers de
 * `db/migrations/002_gamification.sql` calculan la XP real. Si cambias una
 * regla aquí, cámbiala también allí.
 */

export const XP = {
  /** Por completar la lección. */
  base: 10,
  /** Bonus por precisión, de mayor a menor umbral (0–1). */
  accuracyTiers: [
    { min: 1, xp: 30 },
    { min: 0.8, xp: 20 },
    { min: 0.6, xp: 10 },
  ],
  /** Lectura rápida: a partir de `fastReadingWpm` palabras por minuto. */
  speedBonus: 10,
  fastReadingWpm: 80,
  /** Bonus el día en que la racha alcanza cada hito. */
  streakMilestones: [
    { days: 7, xp: 100 },
    { days: 30, xp: 200 },
  ],
} as const;

/** XP máxima de una lección sin bonus de racha (10 + 30 + 10). */
export const MAX_LESSON_XP = XP.base + XP.accuracyTiers[0].xp + XP.speedBonus;

export type XpBreakdown = {
  base: number;
  accuracy: number;
  speed: number;
  streak: number;
  total: number;
};

export function accuracyBonus(accuracy: number): number {
  // Dos decimales, como DECIMAL(3,2) en la BD.
  const pct = Math.round(accuracy * 100);
  return XP.accuracyTiers.find((t) => pct >= Math.round(t.min * 100))?.xp ?? 0;
}

export function streakBonus(newStreak: number, streakAdvancedToday: boolean): number {
  if (!streakAdvancedToday) return 0;
  return XP.streakMilestones.find((m) => m.days === newStreak)?.xp ?? 0;
}

/**
 * XP de completar una lección por primera vez.
 * `streak`: racha que tendrá el usuario tras completarla y si avanzó hoy.
 */
export function calculateLessonXp(input: {
  accuracy: number;
  readingSpeed: number | null;
  streak?: { next: number; advancedToday: boolean };
}): XpBreakdown {
  const accuracy = accuracyBonus(input.accuracy);
  const speed = (input.readingSpeed ?? 0) >= XP.fastReadingWpm ? XP.speedBonus : 0;
  const streak = input.streak ? streakBonus(input.streak.next, input.streak.advancedToday) : 0;
  return { base: XP.base, accuracy, speed, streak, total: XP.base + accuracy + speed + streak };
}

// --- Fechas (días naturales UTC, como los triggers) ---------------------------

const DAY_MS = 86_400_000;

/** Número de día UTC desde epoch. */
export function utcDayNumber(date: string | number | Date): number {
  return Math.floor(new Date(date).getTime() / DAY_MS);
}

/** «2026-11-01» (UTC). */
export function utcDateKey(date: string | number | Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

/** La racha guardada solo sigue viva si hubo actividad hoy o ayer (UTC). */
export function effectiveStreak(streak: number, lastActivity: string | null, now: number = Date.now()): number {
  if (!lastActivity) return 0;
  return utcDayNumber(now) - utcDayNumber(lastActivity) <= 1 ? streak : 0;
}

/** Racha que tendría el usuario si completa una lección nueva ahora. */
export function nextStreak(streak: number, lastActivity: string | null, now: number = Date.now()) {
  const today = utcDayNumber(now);
  const last = lastActivity ? utcDayNumber(lastActivity) : null;
  if (last === today) return { next: Math.max(streak, 1), advancedToday: false };
  if (last === today - 1) return { next: streak + 1, advancedToday: true };
  return { next: 1, advancedToday: true };
}

// --- Agregados sobre el progreso ---------------------------------------------

/** Lo mínimo de una fila de progreso que necesitan los cálculos. */
export type ProgressFact = {
  lesson_id: number;
  completed_at: string;
  xp_earned: number;
  attempts: number;
  accuracy: number | null;
  reading_speed: number | null;
};

/** Lo mínimo de una lección que necesitan los cálculos. */
export type LessonFact = { id: number; day: number; week: number; word_count: number };

/** Palabras hebreas leídas: palabras de cada lección × veces completada. */
export function wordsRead(rows: ProgressFact[], wordCountByLesson: Map<number, number>): number {
  return rows.reduce((sum, r) => sum + (wordCountByLesson.get(r.lesson_id) ?? 0) * r.attempts, 0);
}

/** Días (UTC) distintos en los que se completó alguna lección. */
export function activeDays(rows: ProgressFact[]): number {
  return new Set(rows.map((r) => utcDateKey(r.completed_at))).size;
}

/** XP ganada en los últimos `days` días (incluido hoy). */
export function xpInLastDays(rows: ProgressFact[], days: number, now: number = Date.now()): number {
  const from = utcDayNumber(now) - (days - 1);
  return rows.reduce((sum, r) => (utcDayNumber(r.completed_at) >= from ? sum + r.xp_earned : sum), 0);
}

export type ActivityDay = {
  /** «YYYY-MM-DD» (UTC). */
  date: string;
  /** Lecciones nuevas completadas ese día. */
  lessons: number;
  xp: number;
};

/** Actividad de los últimos `days` días (UTC), del más antiguo a hoy. */
export function activityLastDays(rows: ProgressFact[], days: number, now: number = Date.now()): ActivityDay[] {
  const today = utcDayNumber(now);
  const out: ActivityDay[] = Array.from({ length: days }, (_, i) => ({
    date: utcDateKey((today - (days - 1) + i) * DAY_MS),
    lessons: 0,
    xp: 0,
  }));
  const byDate = new Map(out.map((d) => [d.date, d]));
  for (const r of rows) {
    const day = byDate.get(utcDateKey(r.completed_at));
    if (day) {
      day.lessons += 1;
      day.xp += r.xp_earned;
    }
  }
  return out;
}

export function average(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}
