"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ApiError } from "@/lib/api-client";
import type { ExerciseResponse, ExerciseResult, LessonResult } from "@/lib/api-types";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLesson } from "@/lib/hooks/useLesson";
import { useProgress } from "@/lib/hooks/useProgress";
import { evaluateExercise, summarizeLesson, TOTAL_DAYS } from "@/lib/lesson";
import { routes } from "@/lib/site";
import { ExerciseContainer, isSupportedExercise } from "./ExerciseContainer";
import { LessonComplete, type SaveState } from "./LessonComplete";
import { LessonContent } from "./LessonContent";
import { LessonHeader } from "./LessonHeader";

type Stage =
  | { kind: "content" }
  | { kind: "exercise"; index: number }
  | { kind: "summary"; result: LessonResult };

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, "server_error", "Algo salió mal. Inténtalo de nuevo.");
}

function scrollToTop() {
  // Respeta `scroll-behavior` de globals.css (suave salvo prefers-reduced-motion).
  window.scrollTo({ top: 0 });
}

/**
 * Flujo completo de una lección: teoría → ejercicios (con feedback inmediato)
 * → guardado en la BD → XP ganada → siguiente lección.
 */
export function LessonPlayer({ day }: { day: number }) {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { lesson, isLoading, error, refetch } = useLesson(day, { enabled: isAuthenticated });
  const { saveResult, isCompleted, getLesson } = useProgress();

  const [stage, setStage] = useState<Stage>({ kind: "content" });
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [saveState, setSaveState] = useState<SaveState | null>(null);

  const loginHref = `${routes.login}?next=${encodeURIComponent(routes.lesson(day))}`;

  // El proxy ya redirige sin sesión; esto cubre la sesión caducada en el cliente.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace(loginHref);
  }, [authLoading, isAuthenticated, loginHref, router]);

  // Datos JSON de la BD: se ignoran los tipos de ejercicio que no sabemos pintar.
  const exercises = useMemo(() => (lesson?.exercises ?? []).filter(isSupportedExercise), [lesson]);
  const total = exercises.length;

  if (authLoading || !isAuthenticated) return <LessonSkeleton label="Comprobando tu sesión…" />;
  if (isLoading) return <LessonSkeleton label="Cargando la lección…" />;

  if (error || !lesson) {
    const notFound = error?.status === 404;
    return (
      <Card padding="lg" className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold">{notFound ? "Lección no encontrada" : "No pudimos cargar la lección"}</h1>
        <FormAlert>{error?.message ?? "Algo salió mal. Inténtalo de nuevo."}</FormAlert>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!notFound && <Button onClick={() => void refetch()}>Reintentar</Button>}
          <Button href={routes.dashboard} variant="outline">
            Volver al panel
          </Button>
        </div>
      </Card>
    );
  }

  const lessonId = lesson.id;
  const resultAt = (index: number) => results.find((r) => r.exerciseIndex === index) ?? null;

  async function save(summary: LessonResult) {
    if (saveState?.status === "saving") return;
    setSaveState({ status: "saving" });
    try {
      const response = await saveResult({
        lesson_id: summary.lessonId,
        accuracy: summary.accuracy,
        reading_speed: summary.readingSpeed,
      });
      setSaveState({ status: "saved", response });
      // Precarga la siguiente lección para que el salto sea instantáneo.
      if (day < TOTAL_DAYS) {
        router.prefetch(routes.lesson(day + 1));
        getLesson(day + 1).catch(() => {});
      }
    } catch (err) {
      setSaveState({ status: "error", error: toApiError(err) });
    }
  }

  function finish() {
    const summary = summarizeLesson(lessonId, results, total);
    setStage({ kind: "summary", result: summary });
    scrollToTop();
    void save(summary);
  }

  function start() {
    if (total === 0) finish();
    else {
      setStage({ kind: "exercise", index: 0 });
      scrollToTop();
    }
  }

  function handleAnswer(index: number, response: ExerciseResponse) {
    // Una sola respuesta por ejercicio (también ante dobles toques rápidos).
    setResults((prev) =>
      prev.some((r) => r.exerciseIndex === index)
        ? prev
        : [...prev, evaluateExercise(exercises[index], response, index, total)],
    );
  }

  function handleNext(index: number) {
    if (!resultAt(index)) return;
    if (index < total - 1) {
      setStage({ kind: "exercise", index: index + 1 });
      scrollToTop();
    } else {
      finish();
    }
  }

  function restart() {
    setStage({ kind: "content" });
    setResults([]);
    setSaveState(null);
    scrollToTop();
  }

  // Pasos: teoría + un paso por ejercicio.
  const steps = total + 1;
  const progress =
    stage.kind === "content"
      ? 0
      : stage.kind === "exercise"
        ? (1 + stage.index + (resultAt(stage.index) ? 1 : 0)) / steps
        : 1;
  const stepLabel =
    stage.kind === "content" ? "Teoría" : stage.kind === "exercise" ? `${stage.index + 1}/${total}` : "¡Hecho!";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <LessonHeader
        day={lesson.day}
        week={lesson.week}
        title={lesson.title}
        description={lesson.description}
        progress={progress}
        stepLabel={stepLabel}
        completed={isCompleted(lesson.id) || saveState?.status === "saved"}
      />

      {stage.kind === "content" && (
        <>
          <LessonContent blocks={lesson.content} />
          <Card variant="sunken" className="flex flex-col items-start gap-4 motion-safe:animate-fade-in sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">
              {total > 0
                ? `¿Listo? Practica con ${total} ${total === 1 ? "ejercicio" : "ejercicios"}.`
                : "Esta lección no tiene ejercicios."}
            </p>
            <Button size="lg" data-swipe="next" onClick={start} className="w-full sm:w-auto">
              {total > 0 ? "Empezar ejercicios" : "Completar lección"}
              <Icon name="arrow" size={20} />
            </Button>
          </Card>
        </>
      )}

      {stage.kind === "exercise" && (
        <>
          <ExerciseContainer
            // Remonta en cada ejercicio: estado local (cronómetro, pistas) limpio.
            key={stage.index}
            exercise={exercises[stage.index]}
            index={stage.index}
            total={total}
            result={resultAt(stage.index)}
            onAnswer={(response) => handleAnswer(stage.index, response)}
            onNext={() => handleNext(stage.index)}
            isLast={stage.index === total - 1}
            minReadingSpeed={lesson.min_reading_speed}
          />
          {lesson.content.length > 0 && (
            <details className="group rounded-2xl border border-border bg-surface p-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 font-medium">
                Repasar la teoría
                <Icon name="arrow" size={18} className="rotate-90 transition-transform group-open:-rotate-90" />
              </summary>
              <LessonContent blocks={lesson.content} className="pt-4" />
            </details>
          )}
        </>
      )}

      {stage.kind === "summary" && (
        <LessonComplete
          day={lesson.day}
          result={stage.result}
          totalExercises={total}
          minReadingSpeed={lesson.min_reading_speed}
          saveState={saveState ?? { status: "saving" }}
          onRetrySave={() => void save(stage.result)}
          onRestart={restart}
        />
      )}
    </div>
  );
}

export function LessonSkeleton({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-4" aria-hidden="true">
        <div className="size-11 animate-pulse rounded-lg bg-surface-sunken" />
        <div className="h-2.5 flex-1 animate-pulse rounded-full bg-surface-sunken" />
      </div>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <div className="h-7 w-32 animate-pulse rounded-full bg-surface-sunken" />
        <div className="h-9 w-3/4 animate-pulse rounded-lg bg-surface-sunken" />
        <div className="h-5 w-full animate-pulse rounded-lg bg-surface-sunken" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}
