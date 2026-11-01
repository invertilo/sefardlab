import type { MascotVariant } from "@/components/splash/mascot/MascotTypes";

export interface RouteConfig {
  variant: MascotVariant;
  message?: string;
}

/**
 * Mapeo de rutas a variantes de mascota.
 * Usado para mostrar la mascota apropiada al navegar entre secciones.
 */
export const routeVariantMap: Record<string, RouteConfig> = {
  // Landing
  "/": { variant: "classic", message: "Bienvenido a Sefardlab" },

  // Auth
  "/login": { variant: "classic", message: "Iniciando sesión..." },
  "/signup": { variant: "classic", message: "Creando tu cuenta..." },

  // App
  "/dashboard": { variant: "gamification", message: "Cargando tu progreso..." },
  "/lesson": { variant: "student", message: "Preparando tu lección..." },
  "/achievements": { variant: "gamification", message: "Cargando insignias..." },
  "/settings": { variant: "classic", message: "Abriendo configuración..." },

  // Rutas dinámicas
  "/lesson/[id]": { variant: "student", message: "Preparando la lección..." },
};

/**
 * Obtiene la configuración de variante para una ruta dada.
 * Si no existe mapeo exacto, intenta coincidir por prefijo.
 */
export function getRouteVariant(pathname: string): RouteConfig {
  // Búsqueda exacta
  if (routeVariantMap[pathname]) {
    return routeVariantMap[pathname];
  }

  // Búsqueda por prefijo
  for (const [route, config] of Object.entries(routeVariantMap)) {
    if (route.endsWith("[id]")) {
      const prefix = route.replace("/[id]", "");
      if (pathname.startsWith(prefix)) {
        return config;
      }
    }
  }

  // Fallback: usar classic
  return { variant: "classic" };
}
