-- =============================================================================
-- Sefardlab · 002_gamification.sql  (Fase 4)
-- Sistema de puntos, palabras leídas, repeticiones e insignias automáticas.
--
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 001_init.sql. Idempotente.
--
-- Reglas (reflejadas en lib/gamification.ts y lib/achievements.ts; si cambias
-- algo aquí, cámbialo también allí):
--   XP por lección (primera vez):
--     10 base
--     + precisión: 100% → +30 · 80–99% → +20 · 60–79% → +10
--     + lectura rápida (≥ 80 ppm) → +10
--     + racha: al alcanzar 7 días → +100 · al alcanzar 30 días → +200
--   Palabras leídas: palabras hebreas de la lección × veces completada.
--   Insignias: las otorga award_achievements() tras cada INSERT/UPDATE de
--   progress. El cliente nunca puede escribir en achievements.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- lessons.word_count: palabras hebreas de la lección (bloques `hebrew` del
-- contenido + `word_count` de los ejercicios de lectura). Columna generada.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lesson_word_count(content JSONB, exercises JSONB)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT (
    COALESCE((
      SELECT SUM(cardinality(regexp_split_to_array(btrim(b ->> 'data'), '\s+')))
      FROM jsonb_array_elements(content) AS b
      WHERE b ->> 'type' = 'hebrew' AND btrim(COALESCE(b ->> 'data', '')) <> ''
    ), 0)
    + COALESCE((
      SELECT SUM((e ->> 'word_count')::INT)
      FROM jsonb_array_elements(exercises) AS e
      WHERE e ->> 'type' = 'reading'
    ), 0)
  )::INT;
$$;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS word_count INT
  GENERATED ALWAYS AS (public.lesson_word_count(content, exercises)) STORED;

-- -----------------------------------------------------------------------------
-- progress.attempts: veces que el usuario completó la lección (para contar
-- palabras leídas al repasar). Solo lo modifican los triggers.
-- -----------------------------------------------------------------------------
ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 1 CHECK (attempts >= 1);
ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS progress_user_completed_idx ON public.progress (user_id, completed_at);

-- =============================================================================
-- Trigger: XP de la lección (BEFORE INSERT en progress) — reemplaza al de 001.
-- La racha nueva se calcula igual que en progress_after_insert (días UTC).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.progress_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  today       DATE := (NOW() AT TIME ZONE 'utc')::DATE;
  last_day    DATE;
  cur_streak  INT;
  new_streak  INT;
  acc_pct     INT;
BEGIN
  SELECT (u.last_activity AT TIME ZONE 'utc')::DATE, u.streak
    INTO last_day, cur_streak
  FROM public.users u WHERE u.id = NEW.user_id
  FOR UPDATE;

  new_streak := CASE
    WHEN last_day = today     THEN GREATEST(COALESCE(cur_streak, 0), 1)
    WHEN last_day = today - 1 THEN COALESCE(cur_streak, 0) + 1
    ELSE 1
  END;

  acc_pct := ROUND(COALESCE(NEW.accuracy, 0) * 100)::INT;

  NEW.completed_at    := NOW();
  NEW.last_attempt_at := NOW();
  NEW.attempts        := 1;
  NEW.xp_earned := 10
    + CASE
        WHEN acc_pct >= 100 THEN 30
        WHEN acc_pct >= 80  THEN 20
        WHEN acc_pct >= 60  THEN 10
        ELSE 0
      END
    + CASE WHEN COALESCE(NEW.reading_speed, 0) >= 80 THEN 10 ELSE 0 END
    -- Bonus de racha solo el día en que se alcanza el hito.
    + CASE
        WHEN last_day IS DISTINCT FROM today AND new_streak = 7  THEN 100
        WHEN last_day IS DISTINCT FROM today AND new_streak = 30 THEN 200
        ELSE 0
      END;

  RETURN NEW;
END;
$$;

-- =============================================================================
-- Trigger: repasar una lección (BEFORE UPDATE en progress)
-- Cuenta un intento más (máx. uno por minuto, para que no se pueda inflar
-- llamando a la API en bucle) y blinda las columnas calculadas.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.progress_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.user_id      := OLD.user_id;
  NEW.lesson_id    := OLD.lesson_id;
  NEW.completed_at := OLD.completed_at;
  NEW.xp_earned    := OLD.xp_earned;

  IF NOW() - COALESCE(OLD.last_attempt_at, OLD.completed_at) >= INTERVAL '1 minute' THEN
    NEW.attempts        := OLD.attempts + 1;
    NEW.last_attempt_at := NOW();
  ELSE
    NEW.attempts        := OLD.attempts;
    NEW.last_attempt_at := OLD.last_attempt_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS progress_track_attempt ON public.progress;
CREATE TRIGGER progress_track_attempt
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.progress_before_update();

-- =============================================================================
-- Insignias: evalúa las 12 condiciones y añade las que falten.
-- IDs y condiciones = lib/achievements.ts.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.award_achievements(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_streak     INT;
  v_words      INT;
  v_best_speed INT;
  earned       TEXT[] := ARRAY[]::TEXT[];
BEGIN
  SELECT u.streak INTO v_streak FROM public.users u WHERE u.id = p_user;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(l.word_count * p.attempts), 0), COALESCE(MAX(p.reading_speed), 0)
    INTO v_words, v_best_speed
  FROM public.progress p
  JOIN public.lessons l ON l.id = p.lesson_id
  WHERE p.user_id = p_user;

  -- Días completados
  IF EXISTS (SELECT 1 FROM public.progress p JOIN public.lessons l ON l.id = p.lesson_id
             WHERE p.user_id = p_user AND l.day = 1) THEN
    earned := earned || 'primer_alef'::TEXT;
  END IF;
  IF EXISTS (SELECT 1 FROM public.progress p JOIN public.lessons l ON l.id = p.lesson_id
             WHERE p.user_id = p_user AND l.day = 7) THEN
    earned := earned || 'alfabeto_completo'::TEXT;
  END IF;
  IF EXISTS (SELECT 1 FROM public.progress p JOIN public.lessons l ON l.id = p.lesson_id
             WHERE p.user_id = p_user AND l.day = 30) THEN
    earned := earned || 'maestro'::TEXT;
  END IF;

  -- Semanas completas (todas las lecciones de la semana)
  IF EXISTS (SELECT 1 FROM public.lessons WHERE week = 2) AND NOT EXISTS (
       SELECT 1 FROM public.lessons l WHERE l.week = 2 AND NOT EXISTS (
         SELECT 1 FROM public.progress p WHERE p.user_id = p_user AND p.lesson_id = l.id)) THEN
    earned := earned || 'semana_2'::TEXT;
  END IF;
  IF EXISTS (SELECT 1 FROM public.lessons WHERE week = 3) AND NOT EXISTS (
       SELECT 1 FROM public.lessons l WHERE l.week = 3 AND NOT EXISTS (
         SELECT 1 FROM public.progress p WHERE p.user_id = p_user AND p.lesson_id = l.id)) THEN
    earned := earned || 'lector_fluido'::TEXT;
  END IF;

  -- Perfeccionista: una semana entera completada con 100% en cada lección
  IF EXISTS (
       SELECT 1
       FROM public.lessons l
       LEFT JOIN public.progress p ON p.lesson_id = l.id AND p.user_id = p_user
       GROUP BY l.week
       HAVING bool_and(COALESCE(p.accuracy, 0) >= 1)) THEN
    earned := earned || 'perfeccionista'::TEXT;
  END IF;

  -- Culturista: lecciones sobre Sefarad (días 13 y 29)
  IF (SELECT COUNT(*) FROM public.progress p JOIN public.lessons l ON l.id = p.lesson_id
      WHERE p.user_id = p_user AND l.day IN (13, 29)) >= 2 THEN
    earned := earned || 'culturista'::TEXT;
  END IF;

  -- Palabras, velocidad y racha
  IF v_words >= 50     THEN earned := earned || 'lector_palabras'::TEXT;    END IF;
  IF v_words >= 1000   THEN earned := earned || 'lector_legendario'::TEXT;  END IF;
  IF v_best_speed >= 100 THEN earned := earned || 'velocidad'::TEXT;        END IF;
  IF v_streak >= 7     THEN earned := earned || 'racha_semanal'::TEXT;      END IF;
  IF v_streak >= 30    THEN earned := earned || 'racha_mensual'::TEXT;      END IF;

  INSERT INTO public.achievements (user_id, achievement_id)
  SELECT p_user, a FROM unnest(earned) AS a
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.progress_after_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.award_achievements(NEW.user_id);
  RETURN NULL;
END;
$$;

-- El nombre ordena el disparo: después de progress_award_xp (racha ya actualizada).
DROP TRIGGER IF EXISTS progress_unlock_achievements ON public.progress;
CREATE TRIGGER progress_unlock_achievements
  AFTER INSERT OR UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.progress_after_change();

REVOKE EXECUTE ON FUNCTION public.progress_before_insert()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.progress_before_update()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.progress_after_change()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_achievements(UUID)   FROM PUBLIC, anon, authenticated;

-- Insignias para el progreso existente antes de esta migración.
SELECT public.award_achievements(u.id) FROM public.users u;
