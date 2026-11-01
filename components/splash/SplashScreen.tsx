"use client";

import { useEffect, useState } from "react";
import { Mascot } from "./mascot/Mascot";
import type { MascotVariant, AnimationState } from "./mascot/MascotTypes";
import "./splash.css";

interface SplashScreenProps {
  isVisible: boolean;
  variant?: MascotVariant;
  message?: string;
  showProgress?: boolean;
}

export function SplashScreen({
  isVisible,
  variant = "classic",
  message,
  showProgress = false,
}: SplashScreenProps) {
  const [state, setState] = useState<AnimationState>("idle");

  useEffect(() => {
    if (!isVisible) {
      // Solo cambiar a exit si ya está visible
      if (state !== "idle") {
        setState("exit");
      }
      return;
    }

    // Transición: idle -> enter -> loading
    const enterTimer = setTimeout(() => {
      setState("enter");
    }, 0);

    const loadingTimer = setTimeout(() => {
      setState("loading");
    }, 600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(loadingTimer);
    };
  }, [isVisible, state]);

  if (!isVisible && state === "exit") {
    return null;
  }

  return (
    <div
      className={`splash-overlay ${isVisible ? "splash-visible" : "splash-hidden"}`}
      role="status"
      aria-live="polite"
      aria-label={message || "Cargando..."}
    >
      <div className="splash-container">
        {/* Fondo con patrón sutil */}
        <div className="splash-background" />

        {/* Contenido principal */}
        <div className="splash-content">
          {/* Mascota animada */}
          <Mascot variant={variant} state={state} className="splash-mascot" />

          {/* Logo/Título */}
          <h1 className="splash-title">Sefardlab</h1>

          {/* Subtítulo */}
          <p className="splash-subtitle">Aprende hebreo, una letra a la vez</p>

          {/* Mensaje personalizado */}
          {message && <p className="splash-message">{message}</p>}

          {/* Barra de progreso indeterminada */}
          {showProgress && (
            <div className="splash-progress">
              <div className="progress-bar" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
