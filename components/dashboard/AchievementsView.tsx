"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useUser } from "@/lib/hooks/useUser";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AchievementBadge } from "./AchievementBadge";
import { formatNumber, usePreviousVisit } from "./hooks";

const dateFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" });

/** Las 12 insignias con fecha de desbloqueo o progreso hacia ellas. */
export function AchievementsView() {
  const router = useRouter();
  const { user, stats, isLoading, error, refetchStats } = useUser();

  useEffect(() => {
    if (!isLoading && !user) router.replace(`${routes.login}?next=${encodeURIComponent(routes.achievements)}`);
  }, [isLoading, user, router]);

  if (error && !stats) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <FormAlert>No pudimos cargar tus insignias. {error.message}</FormAlert>
        <Button variant="outline" onClick={() => void refetchStats()} className="self-start">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">
        <span className="sr-only">Cargando tus insignias…</span>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} aria-hidden="true" className="h-40 animate-pulse rounded-2xl bg-surface-sunken" />
        ))}
      </div>
    );
  }

  return <AchievementList userId={user.id} stats={stats} />;
}

function AchievementList({
  userId,
  stats,
}: {
  userId: string;
  stats: NonNullable<ReturnType<typeof useUser>["stats"]>;
}) {
  const unlockedAt = new Map(stats.achievements_detail.map((a) => [a.id, a.unlocked_at]));
  // Comparte la clave con el panel: lo ya visto allí no se vuelve a animar.
  const seen = usePreviousVisit(`sefardlab:achievements:${userId}`, stats.achievements);
  const seenSet = new Set(seen ?? []);
  const pct = Math.round((unlockedAt.size / ACHIEVEMENTS.length) * 100);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Button href={routes.dashboard} variant="ghost" size="sm" className="self-start">
          <Icon name="arrow" size={16} className="rotate-180" />
          Volver al panel
        </Button>
        <h1 className="text-3xl font-bold md:text-4xl">Tus insignias</h1>
        <p className="m-0 text-muted">
          Has desbloqueado <strong className="text-text">{unlockedAt.size}</strong> de {ACHIEVEMENTS.length}. Se
          consiguen solas al completar lecciones.
        </p>
        <div
          role="progressbar"
          aria-label="Insignias desbloqueadas"
          aria-valuemin={0}
          aria-valuemax={ACHIEVEMENTS.length}
          aria-valuenow={unlockedAt.size}
          className="h-3 max-w-md overflow-hidden rounded-full bg-surface-sunken"
        >
          <div className="h-full rounded-full bg-secondary transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const date = unlockedAt.get(a.id);
          const unlocked = date !== undefined;
          const progress = stats.achievement_progress[a.id];
          const progressPct = progress.target > 0 ? Math.round((progress.current / progress.target) * 100) : 0;
          return (
            <li key={a.id} id={a.id} className="scroll-mt-24 rounded-2xl target:ring-2 target:ring-focus">
              <Card
                as="article"
                aria-labelledby={`${a.id}-name`}
                className={cn("flex h-full gap-4", unlocked && "border-secondary")}
              >
                <AchievementBadge achievement={a} unlocked={unlocked} fresh={unlocked && !seenSet.has(a.id)} delay={i * 60} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <h2 id={`${a.id}-name`} className={cn("text-lg font-bold", !unlocked && "text-muted")}>
                    {a.name}
                  </h2>
                  <p className="m-0 text-sm text-muted">{a.description}</p>
                  {unlocked ? (
                    <p className="m-0 mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                      <Icon name="check" size={16} />
                      Desbloqueada el <time dateTime={date}>{dateFormat.format(new Date(date))}</time>
                    </p>
                  ) : (
                    <div className="mt-auto flex flex-col gap-1">
                      <div
                        role="progressbar"
                        aria-label={`Progreso hacia ${a.name}`}
                        aria-valuemin={0}
                        aria-valuemax={progress.target}
                        aria-valuenow={progress.current}
                        className="h-2 overflow-hidden rounded-full bg-surface-sunken"
                      >
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
                      </div>
                      <p className="m-0 text-xs font-medium text-muted">
                        {formatNumber(progress.current)} / {formatNumber(progress.target)} {a.unit}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
