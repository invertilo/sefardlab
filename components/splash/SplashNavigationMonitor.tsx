"use client";

import { useSplashIntegration } from "@/hooks/useSplashIntegration";

/**
 * Componente invisible que monitorea cambios de ruta y muestra el Splash Screen.
 * Debe incluirse en el layout raíz de la aplicación.
 */
export function SplashNavigationMonitor() {
  useSplashIntegration();
  return null;
}
