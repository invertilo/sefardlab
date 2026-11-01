"use client";

import { Mascot } from "./mascot/Mascot";
import "./splash.css";

/** Estático: se renderiza en el servidor como `loading.tsx` mientras llega la ruta. */
export function SplashFallback({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="splash-overlay splash-visible" role="status" aria-live="polite" aria-label={message}>
      <div className="splash-container">
        <div className="splash-background" />
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
