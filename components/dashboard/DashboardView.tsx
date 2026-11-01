"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useUser } from "@/lib/hooks/useUser";
import { routes } from "@/lib/site";
import { AchievementGrid } from "./AchievementGrid";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { NextLessonCard } from "./NextLessonCard";
import { StatsGrid } from "./StatsGrid";
import { StreakCounter } from "./StreakCounter";
import { UserHeader } from "./UserHeader";
import { XPBar } from "./XPBar";

/** Panel principal: todo sale de `/api/user/stats` (vía `useUser`). */
export function DashboardView() {
  const router = useRouter();
  const { user, stats, isLoading, error, refetchStats } = useUser();

  // El proxy ya redirige sin sesión; esto cubre la sesión caducada en el cliente.
  useEffect(() => {
    if (!isLoading && !user) router.replace(`${routes.login}?next=${encodeURIComponent(routes.dashboard)}`);
  }, [isLoading, user, router]);

  if (error && !stats) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <FormAlert>No pudimos cargar tu panel. {error.message}</FormAlert>
        <Button variant="outline" onClick={() => void refetchStats()} className="self-start">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!user || !stats) return <DashboardSkeleton />;

  const nextDay = stats.next_lesson?.day ?? 1;

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <UserHeader user={user} xpTotal={stats.xp_total} streak={stats.streak} />

      <div className="grid gap-4 lg:grid-cols-3">
        <NextLessonCard stats={stats} className="lg:col-span-2" />
        <StreakCounter streak={stats.streak} userId={user.id} />
      </div>

      <StatsGrid stats={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <XPBar weeklyXp={stats.weekly_xp} monthlyXp={stats.monthly_xp} />
        <ActivityHeatmap days={stats.activity} />
      </div>

      <AchievementGrid unlocked={stats.achievements} userId={user.id} />

      <nav aria-label="Acciones" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button href={routes.lesson(nextDay)} size="lg">
          {stats.challenge_completed ? "Repasar una lección" : "Comenzar lección"}
          <Icon name="arrow" size={20} />
        </Button>
        <Button href={routes.achievements} variant="outline" size="lg">
          <Icon name="trophy" size={20} />
          Ver todas las insignias
        </Button>
        <Button variant="ghost" size="lg" disabled>
          <Icon name="settings" size={20} />
          Configuración (pronto)
        </Button>
      </nav>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-live="polite">
      <span className="sr-only">Cargando tu panel…</span>
      <div className="flex items-center gap-4" aria-hidden="true">
        <div className="size-14 animate-pulse rounded-full bg-surface-sunken md:size-16" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-8 w-56 max-w-full animate-pulse rounded-lg bg-surface-sunken" />
          <div className="h-4 w-40 animate-pulse rounded-lg bg-surface-sunken" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3" aria-hidden="true">
        <div className="h-64 animate-pulse rounded-2xl bg-surface-sunken lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-sunken" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}
