import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ExerciseResult } from "@/lib/api-types";
import { cn } from "@/lib/utils";

type ExerciseFeedbackProps = {
  result: ExerciseResult | null;
  /** Detalle extra (p. ej. la respuesta correcta o la velocidad). */
  children?: ReactNode;
};

/** Retroalimentación inmediata ✓/✗ con la XP del ejercicio. Anunciada a lectores de pantalla. */
export function ExerciseFeedback({ result, children }: ExerciseFeedbackProps) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {result && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border-[1.5px] p-4 motion-safe:animate-slide-up",
            result.correct ? "border-success/40 bg-success-soft" : "border-accent-strong/40 bg-accent-soft",
          )}
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              result.correct ? "bg-success text-surface" : "bg-accent-strong text-surface",
            )}
          >
            <Icon name={result.correct ? "check" : "x"} size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3">
              <p className={cn("font-bold", result.correct ? "text-success" : "text-accent-strong")}>
                {result.correct ? "¡Correcto!" : "Incorrecto"}
              </p>
              {result.xp > 0 && (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-text">
                  <Icon name="star" size={16} className="text-secondary-hover" />+{result.xp} XP
                </span>
              )}
            </div>
            {children && <p className="text-sm text-text">{children}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
