"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Item = {
  he: string;
  answer: string;
  meaning: string;
  options: string[];
};

/** Mini lección de la landing: ver la palabra, elegir cómo se lee. */
const items: Item[] = [
  { he: "שָׁלוֹם", answer: "shalom", meaning: "hola, paz", options: ["jalom", "shalom", "salem", "lashón"] },
  { he: "תּוֹדָה", answer: "todá", meaning: "gracias", options: ["torá", "dová", "todá", "tová"] },
  { he: "סֵפֶר", answer: "séfer", meaning: "libro", options: ["séfer", "safar", "kéfer", "sapir"] },
];

export function LessonDemo() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);

  const item = items[index];
  const answered = picked !== null;
  const correct = picked === item.answer;
  const progress = ((index + (answered ? 1 : 0)) / items.length) * 100;

  function choose(option: string) {
    if (answered) return;
    setPicked(option);
    if (option === item.answer) setXp((v) => v + 15);
  }

  function next() {
    setPicked(null);
    setIndex((i) => (i + 1) % items.length);
    if (index === items.length - 1) setXp(0);
  }

  return (
    <div className="relative grid place-items-center py-8">
      {/* Arco sefardí detrás de la tarjeta */}
      <div
        aria-hidden="true"
        className="absolute aspect-[4/5] w-[min(100%,26rem)] rounded-[999px_999px_2rem_2rem] bg-band after:absolute after:inset-3.5 after:rounded-[inherit] after:border-[1.5px] after:border-secondary/55"
      />

      <section
        aria-label="Demo de lección"
        className="relative flex w-[min(100%,21rem)] flex-col gap-4 rounded-[1.25rem] bg-surface p-6 shadow-3"
      >
        <div className="flex items-center gap-4">
          <div
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken"
            role="progressbar"
            aria-label="Progreso de la lección"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <span
              className="block h-full rounded-full bg-secondary transition-[width] duration-500 ease-out-soft"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-accent-strong">
            <Icon name="fire" size={18} />
            <span>
              12 <span className="sr-only">días de racha</span>
            </span>
          </span>
        </div>

        <p className="text-sm font-medium text-muted">Día 9 · ¿Cómo se lee esta palabra?</p>

        <div className="flex flex-col items-center gap-1 pb-2 pt-4">
          <span lang="he" dir="rtl" className="font-hebrew text-5xl font-bold leading-tight text-text">
            {item.he}
          </span>
          <span className={cn("h-5 text-sm tracking-wide text-muted", !answered && "invisible")}>
            {item.meaning}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {item.options.map((option) => {
            const isAnswer = option === item.answer;
            const isPicked = option === picked;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                aria-disabled={answered || undefined}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-b-[3px] border-border bg-surface text-sm font-medium text-text transition-colors",
                  !answered && "cursor-pointer hover:border-primary hover:bg-primary-soft",
                  answered && isAnswer && "border-success bg-success-soft",
                  answered && isPicked && !isAnswer && "border-accent-strong bg-accent-soft",
                  answered && !isAnswer && !isPicked && "opacity-60",
                )}
              >
                {answered && isAnswer && <Icon name="check" size={16} className="text-success" />}
                {option}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="min-h-11">
          {answered && (
            <div className="flex items-center justify-between gap-3">
              <p className={cn("text-sm font-medium", correct ? "text-success" : "text-accent-strong")}>
                {correct ? "¡Exacto!" : `Se lee «${item.answer}».`}
              </p>
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-hover"
              >
                {index === items.length - 1 ? "Repetir" : "Siguiente"}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <div
        aria-hidden="true"
        className="absolute right-0 top-[4%] hidden sm:inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2.5 text-sm font-bold text-text shadow-2 motion-safe:animate-bob"
      >
        <span className="grid size-7 place-items-center rounded-full bg-secondary text-on-secondary">
          <Icon name="star" size={16} />
        </span>
        +{xp} XP
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-[4%] left-0 hidden sm:inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2.5 text-sm font-bold text-text shadow-2 motion-safe:animate-bob-slow"
      >
        <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-primary">
          <Icon name="book" size={16} />
        </span>
        Fase 2 · Palabras
      </div>
    </div>
  );
}
