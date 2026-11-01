"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSplash } from "./useSplash";
import { getRouteVariant } from "@/lib/splash/routeConfig";

const MIN_VISIBLE_MS = 700;
const MAX_VISIBLE_MS = 8000;

/**
 * Muestra el splash al cambiar de ruta y lo oculta cuando los datos del usuario
 * terminan de cargar (`isLoading` de useUser), con un mínimo para que la
 * animación de entrada se vea y un máximo de seguridad si la red falla.
 */
export function useSplashIntegration(isLoading: boolean) {
  const pathname = usePathname();
  const { show, hide } = useSplash();
  const previousPathname = useRef(pathname);
  const shownAt = useRef<number | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const config = getRouteVariant(pathname);
    show({ variant: config.variant, message: config.message, showProgress: true });
    shownAt.current = Date.now();

    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => {
      shownAt.current = null;
      hide();
    }, MAX_VISIBLE_MS);
  }, [pathname, show, hide]);

  useEffect(() => {
    if (shownAt.current === null || isLoading) return;

    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const timer = setTimeout(() => {
      shownAt.current = null;
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      hide();
    }, remaining);
    return () => clearTimeout(timer);
  }, [isLoading, pathname, hide]);

  useEffect(() => () => {
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
  }, []);
}
