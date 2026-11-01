import type { MascotVariant } from "@/components/splash/mascot/MascotTypes";

export interface RouteConfig {
  variant: MascotVariant;
  message?: string;
}

export const routeVariantMap: Record<string, RouteConfig> = {
  "/": { variant: "classic", message: "Bienvenido a Sefardlab" },
  "/login": { variant: "classic", message: "Iniciando sesión..." },
  "/signup": { variant: "classic", message: "Creando tu cuenta..." },
  "/dashboard": { variant: "gamification", message: "Cargando tu progreso..." },
  "/lesson": { variant: "student", message: "Preparando tu lección..." },
  "/achievements": { variant: "gamification", message: "Cargando insignias..." },
  "/settings": { variant: "classic", message: "Abriendo configuración..." },
  "/lesson/[id]": { variant: "student", message: "Preparando la lección..." },
};

export function getRouteVariant(pathname: string): RouteConfig {
  if (routeVariantMap[pathname]) {
    return routeVariantMap[pathname];
  }

  for (const [route, config] of Object.entries(routeVariantMap)) {
    if (route.endsWith("[id]")) {
      const prefix = route.replace("/[id]", "");
      if (pathname.startsWith(prefix)) {
        return config;
      }
    }
  }

  return { variant: "classic" };
}
