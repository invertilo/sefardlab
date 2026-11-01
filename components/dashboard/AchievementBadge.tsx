import { Icon } from "@/components/ui/Icon";
import type { AchievementDefinition } from "@/lib/achievements";
import { cn } from "@/lib/utils";

type AchievementBadgeProps = {
  achievement: AchievementDefinition;
  unlocked: boolean;
  /** Recién desbloqueada desde la última visita: entra con pop-in. */
  fresh?: boolean;
  /** Retraso de la animación (ms), para escalonar varias. */
  delay?: number;
  size?: "md" | "lg";
};

/** Medalla circular: dorada si está desbloqueada, apagada con candado si no. */
export function AchievementBadge({ achievement, unlocked, fresh = false, delay = 0, size = "md" }: AchievementBadgeProps) {
  return (
    <span
      aria-hidden="true"
      style={fresh ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border-2",
        size === "lg" ? "size-20 text-4xl" : "size-14 text-2xl sm:size-16 sm:text-3xl",
        unlocked
          ? "border-secondary bg-secondary-soft shadow-[0_0_0_4px_var(--secondary-soft)]"
          : "border-dashed border-border-strong bg-surface-sunken",
        fresh && "motion-safe:animate-pop-in",
      )}
    >
      <span className={cn(/[\u0590-\u05FF]/.test(achievement.glyph) && "font-hebrew font-bold", !unlocked && "opacity-40 grayscale")}>
        {achievement.glyph}
      </span>
      {!unlocked && (
        <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border border-border bg-surface text-muted">
          <Icon name="lock" size={14} />
        </span>
      )}
    </span>
  );
}
