"use client";

import type { UserStats } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { formatNumber, useCountUp } from "./hooks";

type Tile = { label: string; value: number | null; unit?: string; glyph: string; hint: string; wide?: boolean };

function StatTile({ tile }: { tile: Tile }) {
  const shown = useCountUp(tile.value ?? 0);
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-1",
        tile.wide && "col-span-2 md:col-span-1",
      )}
    >
      <dt className="flex items-center gap-2 text-sm font-medium text-muted">
        <span aria-hidden="true">{tile.glyph}</span>
        {tile.label}
      </dt>
      <dd className="m-0 flex items-baseline gap-1.5">
        {tile.value === null ? (
          <span className="font-display text-3xl font-bold text-muted">—</span>
        ) : (
          <>
            <span className="font-display text-3xl font-bold tabular-nums" aria-hidden="true">
              {formatNumber(shown)}
            </span>
            <span className="sr-only">{formatNumber(tile.value)}</span>
          </>
        )}
        {tile.unit && <span className="text-sm font-medium text-muted">{tile.unit}</span>}
      </dd>
      <p className="m-0 text-xs text-muted">{tile.hint}</p>
    </div>
  );
}

type StatsGridProps = {
  stats: Pick<UserStats, "xp_total" | "words_read" | "avg_speed" | "best_speed" | "days_active" | "streak">;
  className?: string;
};

export function StatsGrid({ stats, className }: StatsGridProps) {
  const tiles: Tile[] = [
    { label: "XP total", value: stats.xp_total, unit: "XP", glyph: "⭐", hint: "Toda la que has ganado", wide: true },
    { label: "Palabras leídas", value: stats.words_read, glyph: "📖", hint: "En hebreo, repasos incluidos" },
    {
      label: "Velocidad media",
      value: stats.avg_speed,
      unit: "ppm",
      glyph: "⚡",
      hint: stats.best_speed ? `Récord: ${stats.best_speed} ppm` : "Haz una lectura cronometrada",
    },
    { label: "Días activos", value: stats.days_active, glyph: "📅", hint: "Con alguna lección nueva" },
    {
      label: "Racha actual",
      value: stats.streak,
      unit: stats.streak === 1 ? "día" : "días",
      glyph: "🔥",
      hint: "Días seguidos",
    },
  ];

  return (
    <section aria-labelledby="stats-title" className={cn("flex flex-col gap-4", className)}>
      <h2 id="stats-title" className="text-2xl font-bold">
        Estadísticas
      </h2>
      <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <StatTile key={t.label} tile={t} />
        ))}
      </dl>
    </section>
  );
}
