"use client";

import { Icon } from "@/components/ui/Icon";
import type { ExerciseResult, MultipleChoiceExercise, MultipleChoiceResponse } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { HebrewText, isHebrew } from "../HebrewText";
import { ExerciseFeedback } from "./ExerciseFeedback";

type MultipleChoiceProps = {
  exercise: MultipleChoiceExercise;
  result: ExerciseResult | null;
  onAnswer: (response: MultipleChoiceResponse) => void;
  disabled?: boolean;
};

export function MultipleChoice({ exercise, result, onAnswer, disabled = false }: MultipleChoiceProps) {
  const answered = result !== null;
  const selected = result?.response.type === "multiple_choice" ? result.response.selected : null;
  const hebrewOptions = exercise.options.some(isHebrew);
  const correctOption = exercise.options[exercise.correct];

  return (
    <div className="flex flex-col gap-5">
      {exercise.prompt && (
        <div className="grid min-h-28 place-items-center rounded-2xl bg-surface-sunken px-4 py-6">
          <HebrewText className="text-center">{exercise.prompt}</HebrewText>
        </div>
      )}

      <div role="group" aria-label="Opciones" className="grid grid-cols-2 gap-3">
        {exercise.options.map((option, i) => {
          const isAnswer = i === exercise.correct;
          const isPicked = i === selected;
          return (
            <button
              key={option}
              type="button"
              onClick={() => !answered && !disabled && onAnswer({ type: "multiple_choice", selected: i })}
              disabled={disabled && !answered}
              aria-disabled={answered || undefined}
              className={cn(
                "relative flex min-h-14 items-center justify-center gap-2 rounded-xl border-[1.5px] border-b-[3px] border-border bg-surface px-3 py-2 text-center font-medium text-text",
                "transition-[background-color,border-color,opacity,transform] duration-150 ease-out-soft",
                !answered && "cursor-pointer hover:border-primary hover:bg-primary-soft active:scale-[0.98]",
                answered && isAnswer && "border-success bg-success-soft motion-safe:animate-pop",
                answered && isPicked && !isAnswer && "border-accent-strong bg-accent-soft",
                answered && !isAnswer && !isPicked && "opacity-55",
                "disabled:opacity-50",
              )}
            >
              {answered && isAnswer && <Icon name="check" size={18} className="text-success" label="Correcta" />}
              {answered && isPicked && !isAnswer && <Icon name="x" size={18} className="text-accent-strong" label="Tu respuesta" />}
              {hebrewOptions && isHebrew(option) ? (
                <HebrewText size={[...option].length <= 3 ? "md" : "sm"}>{option}</HebrewText>
              ) : (
                <span className="text-base sm:text-lg">{option}</span>
              )}
            </button>
          );
        })}
      </div>

      <ExerciseFeedback result={result}>
        {result && !result.correct && (
          <>
            La respuesta correcta es{" "}
            {isHebrew(correctOption) ? (
              <HebrewText size="sm">{correctOption}</HebrewText>
            ) : (
              <strong>«{correctOption}»</strong>
            )}
            .
          </>
        )}
      </ExerciseFeedback>
    </div>
  );
}
