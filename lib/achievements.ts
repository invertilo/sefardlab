import type { IconName } from "@/components/ui/Icon";

/**
 * Catálogo de las 12 insignias. Las desbloquea la BD
 * (`public.award_achievements`, db/migrations/002_gamification.sql); aquí solo
 * se describen y se calcula el progreso hacia cada una para mostrarlo.
 * Mantén ids y umbrales sincronizados con la migración.
 */

export const ACHIEVEMENT_IDS = [
  "primer_alef",
  "alfabeto_completo",
  "lector_palabras",
  "semana_2",
  "lector_fluido",
  "velocidad",
  "racha_semanal",
  "racha_mensual",
  "perfeccionista",
  "culturista",
  "maestro",
  "lector_legendario",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export function isAchievementId(value: string): value is AchievementId {
  return (ACHIEVEMENT_IDS as readonly string[]).includes(value);
}

/** Datos del usuario con los que se mide el progreso hacia cada insignia. */
export type AchievementFacts = {
  completedDays: ReadonlySet<number>;
  /** Lecciones completadas/total por semana y si todas tienen 100%. */
  weeks: ReadonlyArray<{ week: number; completed: number; total: number; perfect: number }>;
  wordsRead: number;
  bestReadingSpeed: number;
  streak: number;
};

export type AchievementProgress = { current: number; target: number };

export type AchievementDefinition = {
  id: AchievementId;
  name: string;
  description: string;
  /** Glifo decorativo de la insignia. */
  visual: { letter: string } | { icon: IconName };
  /** Unidad para el texto de progreso («3/7 lecciones»). */
  unit: string;
  progress: (facts: AchievementFacts) => AchievementProgress;
};

/** Días del reto dedicados a la cultura sefardí (seed: 13 y 29). */
export const CULTURE_DAYS = [13, 29] as const;

const dayDone = (day: number) => (f: AchievementFacts) => ({ current: f.completedDays.has(day) ? 1 : 0, target: 1 });

const weekDone = (week: number) => (f: AchievementFacts) => {
  const w = f.weeks.find((x) => x.week === week);
  return { current: w?.completed ?? 0, target: w?.total || 1 };
};

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: "primer_alef",
    name: "Primer Álef",
    description: "Completa la lección 1.",
    visual: { letter: "א" },
    unit: "lección",
    progress: dayDone(1),
  },
  {
    id: "alfabeto_completo",
    name: "Alfabeto Completo",
    description: "Completa el día 7 y cierra la fase del alfabeto.",
    visual: { icon: "type" },
    unit: "lección",
    progress: dayDone(7),
  },
  {
    id: "lector_palabras",
    name: "Lector de Palabras",
    description: "Lee 50 palabras en hebreo.",
    visual: { icon: "book" },
    unit: "palabras",
    progress: (f) => ({ current: f.wordsRead, target: 50 }),
  },
  {
    id: "semana_2",
    name: "Semana 2 Completada",
    description: "Termina todas las lecciones de la semana 2.",
    visual: { icon: "calendar" },
    unit: "lecciones",
    progress: weekDone(2),
  },
  {
    id: "lector_fluido",
    name: "Lector Fluido",
    description: "Completa todas las lecciones de la semana 3.",
    visual: { icon: "waves" },
    unit: "lecciones",
    progress: weekDone(3),
  },
  {
    id: "velocidad",
    name: "Velocidad",
    description: "Lee a 100 palabras por minuto o más.",
    visual: { icon: "bolt" },
    unit: "ppm",
    progress: (f) => ({ current: f.bestReadingSpeed, target: 100 }),
  },
  {
    id: "racha_semanal",
    name: "Racha Semanal",
    description: "Completa lecciones 7 días seguidos.",
    visual: { icon: "fire" },
    unit: "días",
    progress: (f) => ({ current: f.streak, target: 7 }),
  },
  {
    id: "racha_mensual",
    name: "Racha Mensual",
    description: "Completa lecciones 30 días seguidos.",
    visual: { icon: "medal" },
    unit: "días",
    progress: (f) => ({ current: f.streak, target: 30 }),
  },
  {
    id: "perfeccionista",
    name: "Perfeccionista",
    description: "Termina una semana entera con 100% de precisión en cada lección.",
    visual: { icon: "target" },
    unit: "lecciones perfectas",
    progress: (f) => {
      // La semana más cercana a estar perfecta.
      const best = [...f.weeks].sort((a, b) => b.perfect / (b.total || 1) - a.perfect / (a.total || 1))[0];
      return { current: best?.perfect ?? 0, target: best?.total || 7 };
    },
  },
  {
    id: "culturista",
    name: "Culturista",
    description: "Aprende sobre Sefarad: completa «Palabras de Sefarad» y «Una historia sefardí».",
    visual: { icon: "landmark" },
    unit: "lecciones",
    progress: (f) => ({ current: CULTURE_DAYS.filter((d) => f.completedDays.has(d)).length, target: CULTURE_DAYS.length }),
  },
  {
    id: "maestro",
    name: "Maestro",
    description: "Completa el día 30 del reto.",
    visual: { icon: "graduation" },
    unit: "lección",
    progress: dayDone(30),
  },
  {
    id: "lector_legendario",
    name: "Lector Legendario",
    description: "Lee 1000 palabras en hebreo en total (los repasos cuentan).",
    visual: { icon: "crown" },
    unit: "palabras",
    progress: (f) => ({ current: f.wordsRead, target: 1000 }),
  },
];

export function getAchievement(id: AchievementId): AchievementDefinition {
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (!def) throw new Error(`Insignia desconocida: ${id}`);
  return def;
}

/** Progreso (acotado al objetivo) hacia todas las insignias. */
export function computeAchievementProgress(facts: AchievementFacts): Record<AchievementId, AchievementProgress> {
  return Object.fromEntries(
    ACHIEVEMENTS.map((a) => {
      const p = a.progress(facts);
      return [a.id, { current: Math.min(p.current, p.target), target: p.target }];
    }),
  ) as Record<AchievementId, AchievementProgress>;
}
