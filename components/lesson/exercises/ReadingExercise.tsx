"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExerciseResult, ReadingExercise as ReadingExerciseData, ReadingResponse } from "@/lib/api-types";
import { formatSeconds, wordsPerMinute, XP } from "@/lib/lesson";
import { cn } from "@/lib/utils";
import { HebrewText } from "../HebrewText";
import { useHebrewSpeech } from "../useHebrewSpeech";
import { ExerciseFeedback } from "./ExerciseFeedback";

type ReadingExerciseProps = {
  exercise: ReadingExerciseData;
  result: ExerciseResult | null;
  onAnswer: (response: ReadingResponse) => void;
  /** Meta de la lección en palabras por minuto (0 = sin meta). */
  minReadingSpeed: number;
  disabled?: boolean;
};

type Phase = "idle" | "reading" | "review";

/**
 * Lectura cronometrada: el alumno pulsa «Empezar», lee en voz alta, pulsa
 * «Terminé», compara con la transliteración (y el audio) y marca si la leyó bien.
 */
export function ReadingExercise({ exercise, result, onAnswer, minReadingSpeed, disabled = false }: ReadingExerciseProps) {
  const answered = result !== null;
  const answeredDuration = result?.response.type === "reading" ? result.response.durationMs : null;

  const [phase, setPhase] = useState<Phase>("idle");
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);

  const speech = useHebrewSpeech();

  useEffect(() => {
    if (phase !== "reading") return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const effectivePhase: Phase = answered ? "review" : phase;
  const durationMs = answeredDuration ?? duration ?? 0;
  const wpm = wordsPerMinute(exercise.word_count, durationMs);
  const metGoal = minReadingSpeed > 0 && wpm >= minReadingSpeed;

  function start() {
    const t = performance.now();
    setStartedAt(t);
    setNow(t);
    setDuration(null);
    setPhase("reading");
  }

  function finish() {
    setDuration(performance.now() - startedAt);
    setPhase("review");
  }

  function assess(selfAssessment: ReadingResponse["selfAssessment"]) {
    if (answered || disabled || duration === null) return;
    onAnswer({ type: "reading", durationMs: Math.round(duration), selfAssessment });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Texto a leer: oculto hasta que arranca el cronómetro para medir de verdad. */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-sunken px-4 py-8 sm:px-8">
        <HebrewText
          as="p"
          aria-hidden={effectivePhase === "idle" || undefined}
          className={cn(
            "text-center transition-[filter,opacity] duration-300",
            effectivePhase === "idle" && "select-none opacity-40 blur-md",
          )}
        >
          {exercise.text}
        </HebrewText>
        {effectivePhase === "idle" && (
          <div className="absolute inset-0 grid place-items-center p-4 motion-safe:animate-fade-in">
            <p className="max-w-xs rounded-xl bg-surface px-4 py-2 text-center text-sm font-medium text-text shadow-2">
              El texto aparece al pulsar «Empezar». Léelo en voz alta.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 font-display text-2xl font-bold tabular-nums text-text">
          <Icon name="clock" size={22} className="text-primary" />
          <span className="sr-only">Tiempo de lectura:</span>
          <span role="timer" aria-live="off">
            {effectivePhase === "reading" ? formatSeconds(now - startedAt) : formatSeconds(durationMs)}
          </span>
        </div>
        <span className="text-sm text-muted">
          {exercise.word_count} palabras
          {minReadingSpeed > 0 && ` · Meta: ${minReadingSpeed} ppm`}
        </span>
      </div>

      {effectivePhase === "idle" && (
        <Button size="lg" fullWidth onClick={start} disabled={disabled}>
          Empezar a leer
          <Icon name="clock" size={20} />
        </Button>
      )}

      {effectivePhase === "reading" && (
        <Button size="lg" fullWidth variant="secondary" onClick={finish}>
          Terminé
          <Icon name="check" size={20} />
        </Button>
      )}

      {effectivePhase === "review" && (
        <div className="flex flex-col gap-4 motion-safe:animate-slide-up">
          <dl className="m-0 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <dt className="text-sm text-muted">Velocidad</dt>
              <dd className="m-0 font-display text-2xl font-bold tabular-nums">
                {wpm} <span className="text-base font-medium text-muted">ppm</span>
              </dd>
            </div>
            <div className="rounded-xl border border-border p-3">
              <dt className="text-sm text-muted">Meta</dt>
              <dd className={cn("m-0 font-display text-2xl font-bold", metGoal ? "text-success" : "text-text")}>
                {minReadingSpeed > 0 ? (metGoal ? "¡Superada!" : `${minReadingSpeed} ppm`) : "Libre"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-1 rounded-xl border-s-4 border-primary bg-primary-soft p-4">
            <p className="text-sm font-medium text-muted">Así se lee</p>
            <p className="text-lg font-semibold text-text">{exercise.transliteration}</p>
            <p className="text-muted">{exercise.translation}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted">Pronunciación</p>
            {speech.available ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => speech.speak(exercise.text, "normal")} aria-pressed={speech.speaking === "normal"}>
                  <Icon name="volume" size={20} />
                  Escuchar
                </Button>
                <Button variant="outline" onClick={() => speech.speak(exercise.text, "slow")} aria-pressed={speech.speaking === "slow"}>
                  <Icon name="volume" size={20} />
                  Despacio
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Tu navegador no tiene una voz en hebreo instalada; usa la transliteración para comprobarlo.
              </p>
            )}
          </div>

          {!answered && (
            <div className="flex flex-col gap-3">
              <p className="font-semibold">¿Lo leíste bien?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={() => assess("correct")} disabled={disabled}>
                  <Icon name="check" size={20} />
                  Sí, lo leí bien
                </Button>
                <Button variant="outline" onClick={() => assess("incorrect")} disabled={disabled}>
                  <Icon name="x" size={20} />
                  Me equivoqué
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="self-center" onClick={start} disabled={disabled}>
                Volver a leer
              </Button>
            </div>
          )}
        </div>
      )}

      <ExerciseFeedback result={result}>
        {result &&
          (result.correct
            ? wpm >= XP.fastReadingWpm
              ? `Leíste a ${wpm} palabras por minuto: ¡lectura rápida! Ganas +${XP.speedBonus} XP de bonus al terminar.`
              : `Leíste a ${wpm} palabras por minuto${metGoal ? " y alcanzas la meta" : ""}. Desde ${XP.fastReadingWpm} ppm ganas +${XP.speedBonus} XP de bonus.`
            : "No pasa nada: escucha el audio, repasa la transliteración y vuelve a intentarlo al repetir la lección.")}
      </ExerciseFeedback>
    </div>
  );
}
