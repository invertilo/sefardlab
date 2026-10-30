import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { phases, routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi panel" };

// TODO(db): el progreso vendrá de la base de datos. Datos de ejemplo en la fase 1.
const currentDay = 1;

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">Tu reto de 30 días</h1>
        <p className="text-muted">Día {currentDay} de 30. Hoy toca: las primeras cinco letras.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary">
              <Icon name="book" size={16} />
              Fase 1 · Alfabeto
            </Badge>
          </div>
          <CardTitle>Lección {currentDay}: א ב ג ד ה</CardTitle>
          <CardDescription>Cinco letras, sus sonidos y tu primera palabra. Unos 10 minutos.</CardDescription>
          <Button href={routes.lesson(currentDay)} className="self-start">
            Empezar lección
            <Icon name="arrow" size={20} />
          </Button>
        </Card>
        <Card className="flex flex-col gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent-strong">
            <Icon name="fire" />
          </span>
          <p className="font-display text-4xl font-bold">0 días</p>
          <p className="text-sm text-muted">de racha. Completa la lección de hoy para empezarla.</p>
        </Card>
      </div>

      <section aria-labelledby="camino" className="flex flex-col gap-6">
        <h2 id="camino" className="text-2xl font-bold">
          Tu camino
        </h2>
        {phases.map((phase) => (
          <div key={phase.key} className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-muted">
              {phase.title} · {phase.days}
            </h3>
            <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0 sm:grid-cols-8">
              {Array.from({ length: phase.to - phase.from + 1 }, (_, i) => phase.from + i).map((day) => {
                const isToday = day === currentDay;
                const tile = cn(
                  "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-bold",
                  isToday
                    ? "bg-secondary text-on-secondary shadow-[0_0_0_4px_var(--secondary-soft)]"
                    : "bg-surface-sunken text-muted",
                );
                return (
                  <li key={day}>
                    {isToday ? (
                      <Link href={routes.lesson(day)} className={tile} aria-label={`Día ${day}, hoy`}>
                        {day}
                      </Link>
                    ) : (
                      <span className={tile} aria-label={`Día ${day}, bloqueado`}>
                        <Icon name="lock" size={16} />
                        <span aria-hidden="true" className="text-xs font-medium">
                          {day}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}
