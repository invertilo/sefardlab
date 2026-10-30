/**
 * Contratos de las APIs (`app/api/**`). Compartidos entre Route Handlers y el
 * cliente (`lib/api-client.ts`), así ambos lados no pueden desincronizarse.
 */
import type { LessonExercise, LessonRow, ProgressRow, UserRow } from "./database.types";

/** Perfil del usuario autenticado (fila de `public.users`). */
export type AuthUser = UserRow;

export type SessionInfo = {
  access_token: string;
  /** Segundos desde epoch (UTC). */
  expires_at: number | null;
};

export type ApiErrorCode =
  | "validation_error"
  | "invalid_json"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "email_taken"
  | "weak_password"
  | "rate_limited"
  | "not_configured"
  | "server_error";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Errores por campo (validación). */
    fields?: Record<string, string>;
  };
};

// --- Auth --------------------------------------------------------------------

export type SignupResponse = {
  user: AuthUser | null;
  session: SessionInfo | null;
  /** true si Supabase exige confirmar el correo antes de iniciar sesión. */
  needsEmailConfirmation: boolean;
};

export type LoginResponse = {
  user: AuthUser;
  session: SessionInfo;
};

export type LogoutResponse = { ok: true };

export type MeResponse = { user: AuthUser | null };

// --- Lecciones ---------------------------------------------------------------

export type LessonSummary = Pick<
  LessonRow,
  "id" | "day" | "week" | "title" | "description" | "min_reading_speed"
>;

export type LessonsResponse = { lessons: LessonSummary[] | LessonRow[] };
export type LessonResponse = { lesson: LessonRow };

// --- Progreso ----------------------------------------------------------------

export type ProgressEntry = ProgressRow & {
  lesson: Pick<LessonRow, "day" | "week" | "title"> | null;
};

export type ProgressResponse = { progress: ProgressEntry[] };

export type SaveProgressResponse = {
  progress: ProgressRow;
  /** XP sumada en esta llamada (0 si la lección ya estaba completada). */
  xpAwarded: number;
  firstCompletion: boolean;
  user: Pick<UserRow, "xp_total" | "streak" | "last_activity">;
};

// --- Ejercicios de lección (cliente) -----------------------------------------
// El servidor guarda un resultado por lección (`SaveProgressInput`); estos
// tipos describen lo que ocurre dentro de la lección, ejercicio a ejercicio.

export type ExerciseType = LessonExercise["type"];

/** Ejercicio concreto según su `type`. */
export type ExerciseOf<T extends ExerciseType> = Extract<LessonExercise, { type: T }>;
export type MultipleChoiceExercise = ExerciseOf<"multiple_choice">;
export type ReadingExercise = ExerciseOf<"reading">;

/** Respuesta del usuario a un ejercicio de opción múltiple. */
export type MultipleChoiceResponse = {
  type: "multiple_choice";
  /** Índice (base 0) de la opción elegida. */
  selected: number;
};

/** Respuesta del usuario a un ejercicio de lectura cronometrada. */
export type ReadingResponse = {
  type: "reading";
  /** Tiempo de lectura medido, en milisegundos. */
  durationMs: number;
  /** Autoevaluación tras comparar con la transliteración. */
  selfAssessment: "correct" | "incorrect";
};

/** Respuesta del usuario (unión discriminada por `type`). */
export type ExerciseResponse = MultipleChoiceResponse | ReadingResponse;

/** Respuesta que corresponde a cada tipo de ejercicio. */
export type ResponseFor<T extends ExerciseType> = Extract<ExerciseResponse, { type: T }>;

/** Resultado evaluado de un ejercicio, el que se acumula durante la lección. */
export type ExerciseResult = {
  /** Posición del ejercicio en `lesson.exercises`. */
  exerciseIndex: number;
  type: ExerciseType;
  correct: boolean;
  response: ExerciseResponse;
  /** XP orientativa del ejercicio (la XP real la calcula la BD al guardar). */
  xp: number;
  /** Palabras por minuto (solo ejercicios de lectura). */
  readingSpeed: number | null;
};

/** Resumen de la lección completa, antes de enviarla a `/api/progress`. */
export type LessonResult = {
  lessonId: number;
  results: ExerciseResult[];
  /** 0–1 */
  accuracy: number;
  /** Mejor velocidad de lectura válida (ppm), null si no hubo lectura. */
  readingSpeed: number | null;
};

// --- Estadísticas ------------------------------------------------------------

export type WeekStats = { week: number; completed: number; total: number };

export type UserStats = {
  xpTotal: number;
  /** Racha vigente: 0 si el último día activo fue antes de ayer (UTC). */
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  /** 0–1 */
  completionRate: number;
  /** Primer día sin completar (31 si terminó el reto). */
  currentDay: number;
  currentWeek: number;
  /** 0–1, null si no hay datos. */
  averageAccuracy: number | null;
  /** Palabras por minuto, null si no hay datos. */
  averageReadingSpeed: number | null;
  bestReadingSpeed: number | null;
  achievementsUnlocked: number;
  lastActivity: string | null;
  weeks: WeekStats[];
};

export type UserStatsResponse = { stats: UserStats };
