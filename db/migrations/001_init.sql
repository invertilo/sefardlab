-- =============================================================================
-- Sefardlab · 001_init.sql
-- Esquema inicial: users, lessons, progress, achievements + RLS + triggers.
--
-- Ejecutar en Supabase → SQL Editor (una sola vez, en un proyecto vacío).
-- Es idempotente en lo posible (IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS).
--
-- Decisiones respecto al borrador de la fase 2:
--   * TIMESTAMPTZ en lugar de TIMESTAMP (Supabase trabaja en UTC; evita
--     ambigüedades de zona horaria al calcular rachas).
--   * users.id referencia auth.users(id) ON DELETE CASCADE: borrar la cuenta
--     de Auth limpia el perfil, el progreso y los logros.
--   * achievements.id es IDENTITY (el borrador era INT sin default, lo que
--     obligaba al cliente a inventar ids).
--   * xp_earned, xp_total, streak y last_activity los calcula la base de datos
--     (triggers SECURITY DEFINER). El cliente no puede escribirlos: la anon key
--     es pública y cualquiera podría llamar a PostgREST directamente.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: users (perfil público, 1:1 con auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT auth.uid()
                REFERENCES auth.users (id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  avatar_color  TEXT NOT NULL DEFAULT 'blue',
  xp_total      INT  NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  streak        INT  NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_activity TIMESTAMPTZ,
  preferences   JSONB NOT NULL
                DEFAULT '{"theme":"system","fontSize":"normal","language":"es"}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabla: lessons (el reto de 30 días; solo lectura para los clientes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id                INT PRIMARY KEY,
  day               INT NOT NULL UNIQUE CHECK (day BETWEEN 1 AND 30),
  week              INT NOT NULL CHECK (week BETWEEN 1 AND 4),
  title             TEXT NOT NULL,
  description       TEXT,
  content           JSONB NOT NULL CHECK (jsonb_typeof(content) = 'array'),
  exercises         JSONB NOT NULL CHECK (jsonb_typeof(exercises) = 'array'),
  min_reading_speed INT NOT NULL DEFAULT 0 CHECK (min_reading_speed >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabla: progress (una fila por usuario y lección completada)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL DEFAULT auth.uid()
                REFERENCES public.users (id) ON DELETE CASCADE,
  lesson_id     INT  NOT NULL REFERENCES public.lessons (id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_speed INT CHECK (reading_speed IS NULL OR reading_speed BETWEEN 0 AND 1000),
  accuracy      DECIMAL(3, 2) CHECK (accuracy IS NULL OR accuracy BETWEEN 0 AND 1),
  xp_earned     INT NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS progress_user_id_idx ON public.progress (user_id);

-- -----------------------------------------------------------------------------
-- Tabla: achievements (logros desbloqueados; la lógica llega en la fase 4)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements (user_id);

-- =============================================================================
-- Permisos a nivel de columna
-- Supabase concede ALL a anon/authenticated por defecto; lo acotamos.
-- =============================================================================
REVOKE ALL ON public.users, public.lessons, public.progress, public.achievements FROM anon, authenticated;

-- lessons: lectura pública (el temario no es secreto).
GRANT SELECT ON public.lessons TO anon, authenticated;

-- users: el usuario lee su perfil y edita solo campos "cosméticos".
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT (id, email, name, avatar_color, preferences) ON public.users TO authenticated;
GRANT UPDATE (name, avatar_color, preferences) ON public.users TO authenticated;

-- progress: inserta resultados y mejora su marca; nunca toca xp_earned.
GRANT SELECT ON public.progress TO authenticated;
GRANT INSERT (user_id, lesson_id, reading_speed, accuracy) ON public.progress TO authenticated;
GRANT UPDATE (reading_speed, accuracy) ON public.progress TO authenticated;

-- achievements: solo lectura para el cliente (los otorga el servidor).
GRANT SELECT ON public.achievements TO authenticated;

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "users: leer el propio perfil" ON public.users;
CREATE POLICY "users: leer el propio perfil" ON public.users
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users: crear el propio perfil" ON public.users;
CREATE POLICY "users: crear el propio perfil" ON public.users
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users: editar el propio perfil" ON public.users;
CREATE POLICY "users: editar el propio perfil" ON public.users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- lessons
DROP POLICY IF EXISTS "lessons: lectura pública" ON public.lessons;
CREATE POLICY "lessons: lectura pública" ON public.lessons
  FOR SELECT TO anon, authenticated USING (true);

-- progress
DROP POLICY IF EXISTS "progress: leer el propio" ON public.progress;
CREATE POLICY "progress: leer el propio" ON public.progress
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "progress: crear el propio" ON public.progress;
CREATE POLICY "progress: crear el propio" ON public.progress
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "progress: mejorar el propio" ON public.progress;
CREATE POLICY "progress: mejorar el propio" ON public.progress
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- achievements
DROP POLICY IF EXISTS "achievements: leer los propios" ON public.achievements;
CREATE POLICY "achievements: leer los propios" ON public.achievements
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- =============================================================================
-- Trigger: crear el perfil al registrarse en Auth
-- Funciona también con confirmación de email activada (cuando signUp() no
-- devuelve sesión y la API no puede insertar bajo RLS).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  meta  JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  prefs JSONB := '{"theme":"system","fontSize":"normal","language":"es"}'::jsonb;
BEGIN
  IF jsonb_typeof(meta -> 'preferences') = 'object' THEN
    prefs := prefs || (meta -> 'preferences');
  END IF;

  INSERT INTO public.users (id, email, name, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(btrim(meta ->> 'name'), ''),
      NULLIF(btrim(meta ->> 'full_name'), ''),   -- Google OAuth
      split_part(NEW.email, '@', 1)
    ),
    prefs
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- Trigger: calcular XP de la lección (BEFORE INSERT en progress)
--   10 base + hasta 40 por precisión + 10 si alcanza la velocidad mínima.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.progress_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  min_speed INT;
BEGIN
  SELECT l.min_reading_speed INTO min_speed FROM public.lessons l WHERE l.id = NEW.lesson_id;

  NEW.completed_at := NOW();
  NEW.xp_earned := 10
    + COALESCE(ROUND(NEW.accuracy * 40)::INT, 0)
    + CASE
        WHEN COALESCE(min_speed, 0) > 0 AND COALESCE(NEW.reading_speed, 0) >= min_speed THEN 10
        ELSE 0
      END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS progress_compute_xp ON public.progress;
CREATE TRIGGER progress_compute_xp
  BEFORE INSERT ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.progress_before_insert();

-- =============================================================================
-- Trigger: sumar XP y actualizar racha (AFTER INSERT en progress)
-- La racha cuenta días naturales (UTC) consecutivos con al menos una lección.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.progress_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  today     DATE := (NOW() AT TIME ZONE 'utc')::DATE;
  last_day  DATE;
BEGIN
  SELECT (u.last_activity AT TIME ZONE 'utc')::DATE INTO last_day
  FROM public.users u WHERE u.id = NEW.user_id
  FOR UPDATE;

  UPDATE public.users u SET
    xp_total = u.xp_total + NEW.xp_earned,
    streak = CASE
      WHEN last_day = today         THEN GREATEST(u.streak, 1)
      WHEN last_day = today - 1     THEN u.streak + 1
      ELSE 1
    END,
    last_activity = NOW()
  WHERE u.id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS progress_award_xp ON public.progress;
CREATE TRIGGER progress_award_xp
  AFTER INSERT ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.progress_after_insert();

-- Las funciones de trigger no deben poder invocarse vía RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.progress_before_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.progress_after_insert()  FROM PUBLIC, anon, authenticated;
