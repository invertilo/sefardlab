import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { UserStats } from "@/lib/api-types";
import { phaseForDay } from "@/lib/lesson";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

type NextLessonCardProps = {
  stats: Pick<
    UserStats,
    | "current_day"
    | "progress_percentage"
    | "lessons_completed"
    | "total_lessons"
    | "next_lesson"
    | "challenge_completed"
  >;
  className?: string;
};

/** Progreso del reto (día actual, % completado) y acceso a la próxima lección. */
export function NextLessonCard({ stats, className }: NextLessonCardProps) {
  const next = stats.next_lesson;
  const phase = phaseForDay(next?.day ?? stats.current_day);
  const started = stats.lessons_completed > 0;

  return (
    <Card as="section" aria-labelledby="next-lesson-title" padding="lg" className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="next-lesson-title" className="text-base font-semibold text-muted">
          Mi progreso
        </h2>
        <Badge variant="primary">
          <Icon name="book" size={16} />
          {phase.title} · {phase.days}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <p className="m-0 flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tabular-nums">Día {stats.current_day}</span>
          <span className="text-muted">de {stats.total_lessons}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Reto completado"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.progress_percentage}
          aria-valuetext={`${stats.progress_percentage}% (${stats.lessons_completed} de ${stats.total_lessons} lecciones)`}
          className="flex h-3 gap-0.5 overflow-hidden rounded-full"
        >
          {/* Un segmento por lección: se lee el avance de un vistazo. */}
          {Array.from({ length: stats.total_lessons }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-full flex-1 transition-colors duration-500",
                i < stats.lessons_completed ? "bg-secondary" : "bg-surface-sunken",
              )}
            />
          ))}
        </div>
        <p className="m-0 text-sm text-muted">
          <strong className="text-text">{stats.progress_percentage}% completado</strong> · {stats.lessons_completed} de{" "}
          {stats.total_lessons} lecciones
        </p>
      </div>

      {next ? (
        <div className="flex flex-col gap-4 rounded-xl bg-surface-sunken p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-sm font-medium text-muted">Próxima lección · Día {next.day}</p>
            <p className="m-0 font-display text-xl font-bold">{next.title}</p>
            {next.description && <p className="m-0 text-sm text-muted">{next.description}</p>}
          </div>
          <Button href={routes.lesson(next.day)} size="lg" className="w-full shrink-0 sm:w-auto">
            {started ? "Continuar lección" : "Comenzar lección"}
            <Icon name="arrow" size={20} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl bg-secondary-soft p-4">
          <p className="m-0 flex items-center gap-2 font-display text-xl font-bold">
            <Icon name="trophy" />
            {stats.challenge_completed ? "¡Reto completado! Mazal tov." : "Aún no hay lecciones disponibles."}
          </p>
          {stats.challenge_completed && (
            <Button href={routes.lesson(1)} variant="outline" className="self-start">
              Repasar desde el día 1
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
