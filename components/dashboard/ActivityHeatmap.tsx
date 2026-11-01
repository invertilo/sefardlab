import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { ActivityDay } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const weekday = new Intl.DateTimeFormat("es", { weekday: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/** «2026-11-01» → Date a medianoche UTC (los días de la racha son UTC). */
function parseDay(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

type ActivityHeatmapProps = {
  /** Últimos 7 días, del más antiguo a hoy (de `/api/user/stats`). */
  days: ActivityDay[];
  className?: string;
};

/** Calendario de la última semana: verde con ✓ si completó lección, gris si no. */
export function ActivityHeatmap({ days, className }: ActivityHeatmapProps) {
  const active = days.filter((d) => d.lessons > 0).length;
  const lastIndex = days.length - 1;

  return (
    <Card as="section" aria-labelledby="activity-title" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="activity-title" className="text-base font-semibold text-muted">
          Últimos 7 días
        </h2>
        <p className="m-0 text-sm font-medium">
          {active} de {days.length} días activos
        </p>
      </div>

      <ol className="m-0 grid list-none grid-cols-7 gap-1.5 p-0 sm:gap-2">
        {days.map((d, i) => {
          const date = parseDay(d.date);
          const done = d.lessons > 0;
          const isToday = i === lastIndex;
          const detail = done
            ? `${d.lessons} ${d.lessons === 1 ? "lección" : "lecciones"} · +${d.xp} XP`
            : "Sin lecciones";
          return (
            <li key={d.date} className="flex flex-col items-center gap-1.5">
              <span className={cn("text-xs font-medium capitalize", isToday ? "text-text" : "text-muted")}>
                {isToday ? "Hoy" : weekday.format(date).replace(".", "")}
              </span>
              <span
                title={`${longDate.format(date)}: ${detail}`}
                className={cn(
                  "grid aspect-square w-full max-w-14 place-items-center rounded-lg transition-colors",
                  done ? "bg-success text-bg" : "border border-border bg-surface-sunken text-muted",
                  isToday && "ring-2 ring-focus ring-offset-2 ring-offset-surface",
                )}
              >
                {done ? <Icon name="check" size={18} /> : null}
                <span className="sr-only">
                  {longDate.format(date)}: {detail}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-4 text-xs text-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-success" /> Lección completada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-border bg-surface-sunken" /> Sin actividad
        </span>
      </div>
    </Card>
  );
}
