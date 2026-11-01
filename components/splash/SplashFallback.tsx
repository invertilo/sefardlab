"use client";

import { Mascot } from "./mascot/Mascot";
import "./splash.css";

/**
 * Estático: se renderiza en el servidor como `loading.tsx` mientras llega la ruta.
 * `data-fallback` retrasa su aparición un instante para que una carga rápida no destelle.
 */
export function SplashFallback({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="splash-overlay splash-visible" data-fallback="" role="status" aria-live="polite" aria-label={message}>
      <div className="splash-backdrop" aria-hidden="true" />
      <div className="splash-surface" aria-hidden="true" />
      <div className="splash-background" aria-hidden="true" />
      <div className="splash-container">
        <div className="splash-content">
          <Mascot variant="classic" state="loading" className="mascot-lg" />
          <h1 className="splash-title">Sefardlab</h1>
          <p className="splash-subtitle">Aprende hebreo, una letra a la vez</p>
          <p className="splash-message">{message}</p>
        </div>
      </div>
    </div>
  );
}
