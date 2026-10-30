/**
 * Lógica pura de una lección: evaluar respuestas, medir velocidad y estimar XP.
 * Las constantes de XP reflejan el trigger `progress_before_insert`
 * (db/migrations/001_init.sql); la XP definitiva siempre la calcula la BD.
 */
import type {
  ExerciseResponse,
  ExerciseResult,
  LessonResult,
  MultipleChoiceExercise,
} from "./api-types";
import type { LessonExercise } from "./database.types";
import { phases } from "./site";

export const TOTAL_DAYS = 30;

export const XP = {
  /** Por completar la lección. */
  base: 10,
  /** Máximo por precisión (proporcional a los aciertos). */
  accuracy: 40,
  /** Si se alcanza `min_reading_speed`. */
  speedBonus: 10,
} as const;

/** Fase del reto (lib/site.ts) a la que pertenece un día. */
export function phaseForDay(day: number) {
  return phases.find((p) => day >= p.from && day <= p.to) ?? phases[0];
}

/** Valida el segmento `[id]` de la URL: entero entre 1 y 30. */
export function parseLessonDay(id: string): number | null {
  const day = Number(id);
  return Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS ? day : null;
}

/** Límite de `reading_speed` que acepta la API (lib/validation.ts). */
export const MAX_READING_SPEED = 1000;

/** Palabras por minuto, redondeadas y acotadas al máximo de la API. 0 si la duración no es válida. */
export function wordsPerMinute(wordCount: number, durationMs: number): number {
  if (!(durationMs > 0) || wordCount <= 0) return 0;
  return Math.min(Math.round((wordCount * 60_000) / durationMs), MAX_READING_SPEED);
}

/** «12,3 s» */
export function formatSeconds(ms: number): string {
  return `${(Math.max(ms, 0) / 1000).toLocaleString("es", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
}

/** XP orientativa de un acierto: la parte de precisión repartida entre ejercicios. */
export function xpPerCorrectAnswer(totalExercises: number): number {
  return totalExercises > 0 ? Math.round(XP.accuracy / totalExercises) : 0;
}

export function evaluateMultipleChoice(exercise: MultipleChoiceExercise, selected: number): boolean {
  return selected === exercise.correct;
}

/** Evalúa una respuesta y construye el `ExerciseResult` correspondiente. */
export function evaluateExercise(
  exercise: LessonExercise,
  response: ExerciseResponse,
  exerciseIndex: number,
  totalExercises: number,
): ExerciseResult {
  let correct = false;
  let readingSpeed: number | null = null;

  if (exercise.type === "multiple_choice" && response.type === "multiple_choice") {
    correct = evaluateMultipleChoice(exercise, response.selected);
  } else if (exercise.type === "reading" && response.type === "reading") {
    correct = response.selfAssessment === "correct";
    readingSpeed = wordsPerMinute(exercise.word_count, response.durationMs);
  } else {
    throw new Error(`La respuesta (${response.type}) no corresponde al ejercicio (${exercise.type}).`);
  }

  return {
    exerciseIndex,
    type: exercise.type,
    correct,
    response,
    xp: correct ? xpPerCorrectAnswer(totalExercises) : 0,
    readingSpeed,
  };
}

/** Agrega los resultados de los ejercicios en el resultado de la lección. */
export function summarizeLesson(lessonId: number, results: ExerciseResult[], totalExercises: number): LessonResult {
  const correct = results.filter((r) => r.correct).length;
  // Solo cuenta la velocidad de lecturas que el alumno marcó como correctas.
  const speeds = results.filter((r) => r.correct && r.readingSpeed !== null).map((r) => r.readingSpeed as number);
  return {
    lessonId,
    results,
    // Una lección sin ejercicios cuenta como completada al 100%.
    accuracy: totalExercises > 0 ? correct / totalExercises : 1,
    readingSpeed: speeds.length > 0 ? Math.max(...speeds) : null,
  };
}

/** Estimación local de la XP de la lección (misma fórmula que la BD). */
export function estimateLessonXp(result: LessonResult, minReadingSpeed: number): number {
  const accuracy = Math.round(result.accuracy * 100) / 100;
  const speedBonus = minReadingSpeed > 0 && (result.readingSpeed ?? 0) >= minReadingSpeed ? XP.speedBonus : 0;
  return XP.base + Math.round(accuracy * XP.accuracy) + speedBonus;
}
