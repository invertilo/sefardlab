"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { usePreviousVisit } from "./hooks";

const MAX_FLAMES = 7;

type StreakCounterProps = {
  streak: number;
  /** Para recordar la racha de la visita anterior (y animar si sube). */
  userId: string;
  className?: string;
};

function streakMessage(streak: number): string {
  if (streak === 0) return "Completa la lección de hoy para encender tu racha.";
  if (streak < 7) return `Te faltan ${7 - streak} ${7 - streak === 1 ? "día" : "días"} para la racha semanal (+100 XP).`;
  if (streak < 30) return `¡Racha semanal conseguida! A ${30 - streak} días de la mensual (+200 XP).`;
  return "¡Racha mensual! Treinta días seguidos leyendo hebreo.";
}

/** Racha grande con 🔥 × días. Tiembla cuando aumenta respecto a la última visita. */
export function StreakCounter({ streak, userId, className }: StreakCounterProps) {
  const previous = usePreviousVisit<number>(`sefardlab:streak:${userId}`, streak);
  const increased = previous !== null && streak > previous;
  const flames = Math.min(streak, MAX_FLAMES);

  return (
    <Card as="section" aria-labelledby="streak-title" className={cn("flex flex-col gap-3", className)}>
      <h2 id="streak-title" className="text-base font-semibold text-muted">
        Racha
      </h2>
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-16 shrink-0 place-items-center rounded-2xl text-4xl",
            streak > 0 ? "bg-accent-soft" : "bg-surface-sunken grayscale",
            streak > 0 && "motion-safe:animate-flicker",
          )}
        >
          🔥
        </span>
        <p className={cn("m-0 flex items-baseline gap-2", increased && "motion-safe:animate-shake")}>
          <span className="font-display text-5xl font-bold tabular-nums leading-none">{streak}</span>
          <span className="text-lg font-medium text-muted">{streak === 1 ? "día" : "días"}</span>
        </p>
      </div>
      {flames > 0 && (
        <p className="m-0 text-xl leading-none tracking-wide" aria-hidden="true">
          {"🔥".repeat(flames)}
          {streak > MAX_FLAMES && <span className="ms-1 text-sm font-semibold text-muted">×{streak}</span>}
        </p>
      )}
      <p className="m-0 text-sm text-muted">{streakMessage(streak)}</p>
      {increased && (
        <p className="sr-only" role="status">
          Tu racha subió a {streak} días.
        </p>
      )}
    </Card>
  );
}
