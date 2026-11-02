"use client";

import { Mascot } from "./mascot/Mascot";
import "./splash.css";

type SplashFallbackProps = {
  message?: string;
  /** Sin retardo de entrada: para el splash de la landing, que debe verse desde el primer pintado. */
  immediate?: boolean;
  /** Fase de salida: el contenido se disuelve y el búho celebra. */
  exiting?: boolean;
};

/**
 * Splash estático que se renderiza en el servidor (loading.tsx y la landing).
 * `data-fallback` retrasa su aparición un instante para que una carga rápida no destelle.
 */
export function SplashFallback({ message = "Cargando...", immediate = false, exiting = false }: SplashFallbackProps) {
  return (
    <div
      className={`splash-overlay ${exiting ? "splash-hidden" : "splash-visible"}`}
      data-phase={exiting ? "exit" : undefined}
      data-fallback={immediate ? undefined : ""}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="splash-backdrop" aria-hidden="true" />
      <div className="splash-surface" aria-hidden="true" />
      <div className="splash-background" aria-hidden="true" />
      <div className="splash-container">
        <div className="splash-content">
          <Mascot variant="classic" state={exiting ? "success" : "loading"} className="mascot-lg" />
          <h1 className="splash-title">Sefardlab</h1>
          <p className="splash-subtitle">Aprende hebreo, una letra a la vez</p>
          <p className="splash-message">{message}</p>
        </div>
      </div>
    </div>
  );
}
