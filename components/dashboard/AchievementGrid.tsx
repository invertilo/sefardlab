"use client";

import Link from "next/link";
import { useId } from "react";
import { Icon } from "@/components/ui/Icon";
import { ACHIEVEMENTS, type AchievementId } from "@/lib/achievements";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AchievementBadge } from "./AchievementBadge";
import { usePreviousVisit } from "./hooks";

type AchievementGridProps = {
  unlocked: AchievementId[];
  userId: string;
  className?: string;
};

/**
 * Las 12 insignias. Al pasar el ratón (o enfocar con teclado / tocar) se ve
 * el nombre y la descripción. Las desbloqueadas desde la última visita entran
 * con una animación pop-in.
 */
export function AchievementGrid({ unlocked, userId, className }: AchievementGridProps) {
  const baseId = useId();
  const unlockedSet = new Set(unlocked);
  const seen = usePreviousVisit<AchievementId[]>(`sefardlab:achievements:${userId}`, unlocked);
  // Primera visita en este navegador: todo cuenta como nuevo.
  const seenSet = new Set(seen ?? []);
  let freshIndex = 0;

  /** Alinea el tooltip para que no se salga por los bordes (4 columnas en móvil, 6 desde sm). */
  function tooltipAlign(index: number): string {
    const mobile = index % 4 === 0 ? "left-0" : index % 4 === 3 ? "right-0" : "left-1/2 -translate-x-1/2";
    const desktop =
      index % 6 === 0
        ? "sm:left-0 sm:right-auto sm:translate-x-0"
        : index % 6 === 5
          ? "sm:left-auto sm:right-0 sm:translate-x-0"
          : "sm:left-1/2 sm:right-auto sm:-translate-x-1/2";
    return cn(mobile, desktop);
  }

  return (
    <section aria-labelledby="achievements-title" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="achievements-title" className="text-2xl font-bold">
          Insignias
        </h2>
        <p className="m-0 text-sm font-medium text-muted">
          {unlocked.length} de {ACHIEVEMENTS.length} desbloqueadas
        </p>
      </div>
      <ul className="m-0 grid list-none grid-cols-4 gap-x-2 gap-y-4 p-0 sm:grid-cols-6">
        {ACHIEVEMENTS.map((a, index) => {
          const isUnlocked = unlockedSet.has(a.id);
          const fresh = isUnlocked && !seenSet.has(a.id);
          const tipId = `${baseId}-${a.id}`;
          return (
            <li key={a.id} className="group relative flex justify-center">
              <Link
                href={`${routes.achievements}#${a.id}`}
                aria-describedby={tipId}
                className="flex flex-col items-center gap-1.5 rounded-xl p-1 text-center"
              >
                <AchievementBadge achievement={a} unlocked={isUnlocked} fresh={fresh} delay={fresh ? freshIndex++ * 120 : 0} />
                <span className={cn("line-clamp-2 text-xs font-medium leading-tight", !isUnlocked && "text-muted")}>
                  {a.name}
                  <span className="sr-only">{isUnlocked ? " (desbloqueada)" : " (bloqueada)"}</span>
                </span>
              </Link>
              <span
                id={tipId}
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute bottom-full z-10 mb-1 w-44 rounded-lg bg-text px-3 py-2 text-xs text-bg shadow-2",
                  tooltipAlign(index),
                  "invisible opacity-0 transition-opacity duration-150",
                  "group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
                )}
              >
                <strong className="block text-sm">{a.name}</strong>
                {a.description}
                <span className="mt-1 block font-semibold"><span className="inline-flex items-center gap-1">
                    <Icon name={isUnlocked ? "check" : "lock"} size={12} />
                    {isUnlocked ? "Desbloqueada" : "Bloqueada"}
                  </span></span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
