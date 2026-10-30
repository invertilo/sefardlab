import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mensaje de estado de formulario (error o éxito), anunciado por lectores de pantalla. */
export function FormAlert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border-[1.5px] px-4 py-3 text-sm font-medium",
        tone === "error"
          ? "border-accent-strong/40 bg-accent-soft text-accent-strong"
          : "border-primary/40 bg-primary-soft text-text",
      )}
    >
      {children}
    </div>
  );
}

/** Destino seguro tras el login: solo rutas internas (evita open redirects). */
export function safeRedirectTarget(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
