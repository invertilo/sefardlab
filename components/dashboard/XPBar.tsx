"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { MAX_LESSON_XP } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { formatNumber, useCountUp } from "./hooks";

type Range = "week" | "month";

const RANGES: Record<Range, { label: string; days: number; title: string }> = {
  week: { label: "Semana", days: 7, title: "XP de los últimos 7 días" },
  month: { label: "Mes", days: 30, title: "XP de los últimos 30 días" },
};

type XPBarProps = {
  weeklyXp: number;
  monthlyXp: number;
  className?: string;
};

/**
 * XP semanal/mensual frente al máximo alcanzable sin bonus de racha
 * (una lección perfecta y rápida al día).
 */
export function XPBar({ weeklyXp, monthlyXp, className }: XPBarProps) {
  const [range, setRange] = useState<Range>("week");
  const value = range === "week" ? weeklyXp : monthlyXp;
  const goal = RANGES[range].days * MAX_LESSON_XP;
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const shown = useCountUp(value);

  return (
    <Card as="section" aria-labelledby="xp-title" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="xp-title" className="text-base font-semibold text-muted">
          {RANGES[range].title}
        </h2>
        <div role="group" aria-label="Periodo" className="inline-flex rounded-lg bg-surface-sunken p-1">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn(
                "min-h-9 rounded-md px-3 text-sm font-medium transition-colors",
                range === r ? "bg-surface text-text shadow-1" : "text-muted hover:text-text",
              )}
            >
              {RANGES[r].label}
            </button>
          ))}
        </div>
      </div>

      <p className="m-0 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold tabular-nums" aria-hidden="true">
          {formatNumber(shown)}
        </span>
        <span className="sr-only">{formatNumber(value)}</span>
        <span className="text-muted">/ {formatNumber(goal)} XP</span>
      </p>

      <div
        role="progressbar"
        aria-label={RANGES[range].title}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(value, goal)}
        className="h-3 overflow-hidden rounded-full bg-surface-sunken"
      >
        <div
          className="h-full rounded-full bg-secondary transition-[width] duration-700 ease-out-soft"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="m-0 text-sm text-muted">
        {pct >= 100
          ? "¡Máximo alcanzado! Todo lo que ganes de más viene de los bonus de racha."
          : `${pct}% del máximo: una lección perfecta al día suma ${MAX_LESSON_XP} XP.`}
      </p>
    </Card>
  );
}
