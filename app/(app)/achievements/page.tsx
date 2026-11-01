import type { Metadata } from "next";
import { AchievementsView } from "@/components/dashboard/AchievementsView";

export const metadata: Metadata = { title: "Insignias" };

/** /achievements: las 12 insignias, desbloqueadas o con su progreso. */
export default function AchievementsPage() {
  return <AchievementsView />;
}
