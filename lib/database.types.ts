/**
 * Tipos de la base de datos de Sefardlab (esquema `public`).
 *
 * Escritos a mano para que coincidan con `db/migrations/001_init.sql` y con el
 * formato que espera `@supabase/supabase-js`. Si cambias el esquema, puedes
 * regenerarlos con:
 *   npx supabase gen types typescript --project-id <id> > lib/database.types.ts
 * (y volver a añadir los tipos JSON de contenido de lección del final).
 *
 * Nota: usar `type` y no `interface` — supabase-js exige `Record<string, unknown>`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// -----------------------------------------------------------------------------
// Estructuras JSONB
// -----------------------------------------------------------------------------

export type Theme = "system" | "light" | "dark";
export type FontSize = "normal" | "large" | "xlarge";
export type Language = "es";
export type HebrewLevel = "none" | "some" | "most";

export type UserPreferences = {
  theme: Theme;
  fontSize: FontSize;
  language: Language;
  /** Minutos al día elegidos en el registro. */
  dailyGoal?: 5 | 10 | 15 | 20;
  /** Nivel declarado en el registro. */
  level?: HebrewLevel;
};

/** Bloque de contenido de una lección (columna `lessons.content`). */
export type LessonContentBlock =
  | { type: "text"; data: string }
  | { type: "hebrew"; data: string; transliteration?: string; translation?: string }
  | { type: "tip"; data: string }
  | {
      type: "image";
      /** URL absoluta o ruta en /public. */
      src: string;
      /** Texto alternativo (obligatorio, accesibilidad). */
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    };

/** Ejercicio de una lección (columna `lessons.exercises`). */
export type LessonExercise =
  | {
      type: "multiple_choice";
      question: string;
      /** Texto hebreo opcional que acompaña a la pregunta. */
      prompt?: string;
      options: string[];
      /** Índice (base 0) de la opción correcta. */
      correct: number;
    }
  | {
      type: "reading";
      /** Instrucción para el alumno. */
      question: string;
      /** Texto hebreo a leer en voz alta (se cronometra). */
      text: string;
      transliteration: string;
      translation: string;
      /** Número de palabras, para calcular palabras por minuto. */
      word_count: number;
    };

// -----------------------------------------------------------------------------
// Esquema
// -----------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_color: string;
          xp_total: number;
          streak: number;
          last_activity: string | null;
          preferences: UserPreferences;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_color?: string;
          preferences?: UserPreferences;
        };
        Update: {
          name?: string;
          avatar_color?: string;
          preferences?: UserPreferences;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: number;
          day: number;
          week: number;
          title: string;
          description: string | null;
          content: LessonContentBlock[];
          exercises: LessonExercise[];
          min_reading_speed: number;
          /** Palabras hebreas de la lección (columna generada, 002_gamification.sql). */
          word_count: number;
          created_at: string;
        };
        Insert: {
          id: number;
          day: number;
          week: number;
          title: string;
          description?: string | null;
          content: LessonContentBlock[];
          exercises: LessonExercise[];
          min_reading_speed?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          day?: number;
          week?: number;
          title?: string;
          description?: string | null;
          content?: LessonContentBlock[];
          exercises?: LessonExercise[];
          min_reading_speed?: number;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: number;
          completed_at: string;
          reading_speed: number | null;
          /** DECIMAL(3,2): PostgREST lo devuelve como número entre 0 y 1. */
          accuracy: number | null;
          xp_earned: number;
          /** Veces completada (los repasos suman; máx. uno por minuto). */
          attempts: number;
          last_attempt_at: string | null;
        };
        Insert: {
          user_id?: string;
          lesson_id: number;
          reading_speed?: number | null;
          accuracy?: number | null;
        };
        Update: {
          reading_speed?: number | null;
          accuracy?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      achievements: {
        Row: {
          id: number;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          achievement_id?: string;
          unlocked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];

export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type UserRow = Tables<"users">;
export type LessonRow = Tables<"lessons">;
export type ProgressRow = Tables<"progress">;
export type AchievementRow = Tables<"achievements">;
