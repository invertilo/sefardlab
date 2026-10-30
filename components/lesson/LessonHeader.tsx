import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { phaseForDay, TOTAL_DAYS } from "@/lib/lesson";
import { routes } from "@/lib/site";
import { ProgressBar } from "./ProgressBar";

type LessonHeaderProps = {
  day: number;
  week: number;
  title: string;
  description?: string | null;
  /** Avance dentro de la lección, 0–1. */
  progress: number;
  /** Texto corto del paso actual, p. ej. «Ejercicio 2 de 4». */
  stepLabel?: string;
  completed?: boolean;
  backHref?: string;
};

export function LessonHeader({
  day,
  week,
  title,
  description,
  progress,
  stepLabel,
  completed = false,
  backHref = routes.dashboard,
}: LessonHeaderProps) {
  const phase = phaseForDay(day);

  return (
    <header className="flex flex-col gap-4 motion-safe:animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button href={backHref} variant="ghost" className="-ms-3 shrink-0 px-3" aria-label="Volver al panel">
          <Icon name="arrow" size={20} className="rotate-180" />
          <span className="hidden sm:inline">Volver</span>
        </Button>
        <ProgressBar value={progress} label="Progreso de la lección" className="flex-1" />
        <span className="shrink-0 text-sm font-medium tabular-nums text-muted">
          {stepLabel ?? `${Math.round(progress * 100)}%`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary">
          Día {day} de {TOTAL_DAYS}
        </Badge>
        <Badge>
          Semana {week} · {phase.title}
        </Badge>
        {completed && (
          <Badge variant="success">
            <Icon name="check" size={16} />
            Completada
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="text-muted">{description}</p>}
      </div>
    </header>
  );
}
