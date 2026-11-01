"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AuthUser } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { formatNumber, useCountUp } from "./hooks";

/** `users.avatar_color` → tokens del tema (sirven en claro y oscuro). */
const AVATAR_COLORS: Record<string, string> = {
  blue: "bg-primary text-on-primary",
  gold: "bg-secondary text-on-secondary",
  yellow: "bg-secondary text-on-secondary",
  red: "bg-accent-strong text-on-accent",
  orange: "bg-accent-strong text-on-accent",
  green: "bg-success text-bg",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase() || "?";
}

type UserHeaderProps = {
  user: Pick<AuthUser, "name" | "avatar_color">;
  xpTotal: number;
  streak: number;
};

/** Avatar, nombre, XP total, racha y acceso a configuración. */
export function UserHeader({ user, xpTotal, streak }: UserHeaderProps) {
  const xp = useCountUp(xpTotal);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-full font-display text-xl font-bold md:size-16",
            AVATAR_COLORS[user.avatar_color] ?? AVATAR_COLORS.blue,
          )}
        >
          {initials(user.name)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-2xl font-bold md:text-3xl">¡Shalom, {user.name}!</h1>
          <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="star" size={16} className="text-secondary" />
              <span aria-hidden="true" className="tabular-nums text-text">
                {formatNumber(xp)}
              </span>
              <span className="sr-only">{formatNumber(xpTotal)}</span> XP
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="fire" size={16} className="text-accent-strong" motion={streak > 0 ? "loop" : "none"} />
              <span className="tabular-nums text-text">{streak}</span> {streak === 1 ? "día de racha" : "días de racha"}
            </span>
          </p>
        </div>
      </div>
      {/* La página de configuración llega en la fase 5. */}
      <Button variant="outline" disabled aria-describedby="settings-soon" className="self-start sm:self-auto">
        <Icon name="settings" size={20} />
        Configuración
        <span id="settings-soon" className="text-xs font-normal text-muted">
          (pronto)
        </span>
      </Button>
    </header>
  );
}
