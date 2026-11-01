"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSplash } from "./useSplash";
import { getRouteVariant } from "@/lib/splash/routeConfig";

/**
 * Hook para integrar Splash Screen con navegación de Next.js.
 * Muestra automáticamente el splash en transiciones de ruta.
 *
 * Características:
 * - No muestra splash para navegaciones muy rápidas (<200ms)
 * - Detecta automáticamente la variante apropiada por ruta
 * - Respeta cambios reales de ruta (evita re-triggers)
 */
export function useSplashIntegration() {
  const pathname = usePathname();
  const { show, hide } = useSplash();
  const currentPathnameRef = useRef(pathname);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Si la ruta no cambió, no hacer nada
    if (currentPathnameRef.current === pathname) {
      return;
    }

    currentPathnameRef.current = pathname;

    // Limpiar timeouts previos
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);

    // No mostrar splash si el contenido aparece muy rápido
    navigationTimeoutRef.current = setTimeout(() => {
      const config = getRouteVariant(pathname);
      show({
        variant: config.variant,
        message: config.message,
        showProgress: true,
      });

      // Auto-hide después de un máximo de 3 segundos
      showTimeoutRef.current = setTimeout(() => {
        hide();
      }, 3000);
    }, 250); // Esperar 250ms antes de mostrar

    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, [pathname, show, hide]);

  // Limpiar en desmontaje
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);
}
