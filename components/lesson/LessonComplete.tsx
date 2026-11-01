"use client";

import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { ApiError } from "@/lib/api-client";
import type { LessonResult, SaveProgressResponse } from "@/lib/api-types";
import { TOTAL_DAYS } from "@/lib/lesson";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export type SaveState =
  | { status: "saving" }
  | { status: "saved"; response: SaveProgressResponse }
  | { status: "error"; error: ApiError };

type LessonCompleteProps = {
  day: number;
  result: LessonResult;
  totalExercises: number;
  minReadingSpeed: number;
  saveState: SaveState;
  onRetrySave: () => void;
  onRestart: () => void;
};

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-surface-sunken p-3 text-center">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={cn("m-0 font-display text-2xl font-bold tabular-nums", tone === "success" && "text-success")}>
        {value}
      </dd>
    </div>
  );
}

export function LessonComplete({
  day,
  result,
  totalExercises,
  minReadingSpeed,
  saveState,
  onRetrySave,
  onRestart,
}: LessonCompleteProps) {
  const isFinal = day >= TOTAL_DAYS;
  const correct = result.results.filter((r) => r.correct).length;
  const accuracyPct = Math.round(result.accuracy * 100);
  const saved = saveState.status === "saved" ? saveState.response : null;
  const metSpeed = minReadingSpeed > 0 && (result.readingSpeed ?? 0) >= minReadingSpeed;
  const nextLabel = isFinal ? "Ver mi panel" : "Siguiente lección";

  return (
    <Card as="section" padding="lg" aria-labelledby="lesson-complete" className="flex flex-col items-center gap-6 text-center motion-safe:animate-slide-up">
      <span
        className={cn(
          "grid size-20 place-items-center rounded-full",
          isFinal ? "bg-secondary text-on-secondary" : "bg-success-soft text-success",
          saved && "motion-safe:animate-pop",
        )}
      >
        <Icon name={isFinal ? "trophy" : "check"} size={40} />
      </span>

      <div className="flex flex-col gap-2">
        <h2 id="lesson-complete" className="text-2xl font-bold sm:text-3xl">
          {isFinal ? "¡Completaste el reto!" : `¡Lección ${day} completada!`}
        </h2>
        <p className="text-muted">
          {isFinal
            ? "Treinta días después, ya lees hebreo. Mazal tov."
            : `Acertaste ${correct} de ${totalExercises} ejercicios.`}
        </p>
      </div>

      <dl className="m-0 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Precisión" value={`${accuracyPct}%`} tone={accuracyPct === 100 ? "success" : undefined} />
        <Stat label="Aciertos" value={`${correct}/${totalExercises}`} />
        {result.readingSpeed !== null && (
          <Stat label="Lectura" value={`${result.readingSpeed} ppm`} tone={metSpeed ? "success" : undefined} />
        )}
      </dl>

      {/* Estado del guardado (anunciado a lectores de pantalla). */}
      <div aria-live="polite" className="flex w-full flex-col items-center gap-3">
        {saveState.status === "saving" && (
          <p className="inline-flex items-center gap-2 font-medium text-muted" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
            Guardando tu progreso…
          </p>
        )}

        {saved && (
          <div className="flex flex-col items-center gap-1 motion-safe:animate-fade-in">
            {saved.firstCompletion ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-5 py-2 font-display text-2xl font-bold text-text">
                <Icon name="star" size={24} />+{saved.xpAwarded} XP
              </p>
            ) : (
              <p className="text-sm text-muted">
                Ya habías completado esta lección: guardamos tu mejor marca, sin XP extra.
              </p>
            )}
            <p className="text-sm text-muted">
              Total: <strong className="text-text">{saved.user.xp_total} XP</strong>
              {saved.user.streak > 0 && ` · Racha: ${saved.user.streak} ${saved.user.streak === 1 ? "día" : "días"}`}
            </p>
          </div>
        )}

        {saveState.status === "error" && (
          <div className="flex w-full flex-col gap-3 text-start">
            <FormAlert>
              No pudimos guardar tu resultado. {saveState.error.message}
            </FormAlert>
            {saveState.error.status === 401 ? (
              <Button href={`${routes.login}?next=${encodeURIComponent(routes.lesson(day))}`} variant="outline">
                Iniciar sesión de nuevo
              </Button>
            ) : (
              <Button variant="outline" onClick={onRetrySave}>
                Reintentar
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row-reverse">
        {/* No se avanza hasta que el resultado esté guardado en la BD. */}
        {saved ? (
          <Button href={isFinal ? routes.dashboard : routes.lesson(day + 1)} size="lg" fullWidth data-swipe="next">
            {nextLabel}
            <Icon name={isFinal ? "trophy" : "arrow"} size={20} />
          </Button>
        ) : (
          <Button size="lg" fullWidth disabled>
            {nextLabel}
            <Icon name={isFinal ? "trophy" : "arrow"} size={20} />
          </Button>
        )}
        <Button variant="outline" size="lg" fullWidth onClick={onRestart} disabled={saveState.status === "saving"}>
          Repetir lección
        </Button>
      </div>
    </Card>
  );
}
