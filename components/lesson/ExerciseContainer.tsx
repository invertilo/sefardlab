"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { ExerciseResponse, ExerciseResult, ExerciseType } from "@/lib/api-types";
import type { LessonExercise } from "@/lib/database.types";
import { MultipleChoice } from "./exercises/MultipleChoice";
import { ReadingExercise } from "./exercises/ReadingExercise";

export const SUPPORTED_EXERCISE_TYPES = ["multiple_choice", "reading"] as const satisfies readonly ExerciseType[];

/** Filtra ejercicios con un `type` que esta versión sabe renderizar (datos JSON de la BD). */
export function isSupportedExercise(exercise: unknown): exercise is LessonExercise {
  return (
    typeof exercise === "object" &&
    exercise !== null &&
    (SUPPORTED_EXERCISE_TYPES as readonly string[]).includes((exercise as { type?: unknown }).type as string)
  );
}

const typeLabels: Record<ExerciseType, string> = {
  multiple_choice: "Elige la respuesta",
  reading: "Lectura cronometrada",
};

type ExerciseContainerProps = {
  exercise: LessonExercise;
  /** Posición (base 0) y total, para «Ejercicio 2 de 4». */
  index: number;
  total: number;
  result: ExerciseResult | null;
  onAnswer: (response: ExerciseResponse) => void;
  onNext: () => void;
  isLast: boolean;
  minReadingSpeed: number;
  disabled?: boolean;
};

export function ExerciseContainer({
  exercise,
  index,
  total,
  result,
  onAnswer,
  onNext,
  isLast,
  minReadingSpeed,
  disabled = false,
}: ExerciseContainerProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [showHint, setShowHint] = useState(false);
  const answered = result !== null;

  // Lleva el foco a la pregunta al cambiar de ejercicio (teclado y lectores de pantalla).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  function handleNext() {
    if (!answered) {
      setShowHint(true);
      return;
    }
    setShowHint(false);
    onNext();
  }

  function handleAnswer(response: ExerciseResponse) {
    setShowHint(false);
    onAnswer(response);
  }

  let body: ReactNode;
  switch (exercise.type) {
    case "multiple_choice":
      body = (
        <MultipleChoice exercise={exercise} result={result} onAnswer={handleAnswer} disabled={disabled} />
      );
      break;
    case "reading":
      body = (
        <ReadingExercise
          exercise={exercise}
          result={result}
          onAnswer={handleAnswer}
          minReadingSpeed={minReadingSpeed}
          disabled={disabled}
        />
      );
      break;
    default: {
      const unreachable: never = exercise;
      throw new Error(`Tipo de ejercicio no soportado: ${JSON.stringify(unreachable)}`);
    }
  }

  return (
    <Card as="section" padding="lg" aria-labelledby={`exercise-${index}`} className="flex flex-col gap-5 motion-safe:animate-slide-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">
          Ejercicio {index + 1} de {total} · {typeLabels[exercise.type]}
        </p>
        <h2 id={`exercise-${index}`} ref={headingRef} tabIndex={-1} className="text-xl font-bold outline-none sm:text-2xl">
          {exercise.question}
        </h2>
      </div>

      {body}

      <div className="flex flex-col gap-2 border-t border-border pt-5">
        {showHint && !answered && (
          <p role="alert" className="text-sm font-medium text-accent-strong">
            {exercise.type === "reading"
              ? "Termina la lectura y marca si la leíste bien antes de continuar."
              : "Elige una respuesta antes de continuar."}
          </p>
        )}
        <Button
          size="lg"
          fullWidth
          onClick={handleNext}
          aria-disabled={!answered || undefined}
          disabled={disabled}
          className={answered ? undefined : "opacity-60"}
        >
          {isLast ? "Terminar lección" : "Siguiente"}
          <Icon name="arrow" size={20} />
        </Button>
      </div>
    </Card>
  );
}
