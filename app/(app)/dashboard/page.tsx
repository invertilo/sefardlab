import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "Mi panel" };

/**
 * /dashboard: el proxy redirige a /login sin sesión. Los datos (XP, racha,
 * insignias, actividad) llegan en el cliente desde `/api/user/stats`.
 */
export default function DashboardPage() {
  return <DashboardView />;
}
