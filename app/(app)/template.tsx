"use client";

import { usePathname } from "next/navigation";
import { routes } from "@/lib/site";

/** Secciones con entrada escalonada de bloques y cuadrículas (ver `[data-stagger]` en globals.css). */
const STAGGERED: readonly string[] = [routes.dashboard, routes.achievements, routes.settings];

/**
 * Se vuelve a montar en cada navegación: la página nueva entra con un fundido
 * y una subida corta (`.route-enter`). La lección no se escalona porque ya
 * anima su propio contenido. Todo se desactiva con prefers-reduced-motion.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="route-enter" data-stagger={STAGGERED.includes(pathname) ? "" : undefined}>
      {children}
    </div>
  );
}
