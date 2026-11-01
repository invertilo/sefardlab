"use client";

import { useEffect, useRef, useState } from "react";
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
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousVisibleRef = useRef(isVisible);

  const shouldRender = isVisible || isExiting;

  const animationState: AnimationState = isVisible
    ? hasEntered
      ? "loading"
      : "enter"
    : "exit";

  // Manejar transiciones (solo en callbacks)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Detectar cambio de isVisible
    const wasVisible = previousVisibleRef.current;
    previousVisibleRef.current = isVisible;

    if (!wasVisible && isVisible) {
      // Acaba de hacerse visible
      setIsExiting(false);
      timerRef.current = setTimeout(() => {
        setHasEntered(true);
      }, 600);
    } else if (wasVisible && !isVisible) {
      // Acaba de ocultarse
      setHasEntered(false);
      setIsExiting(true);
      timerRef.current = setTimeout(() => {
        setIsExiting(false);
      }, 400);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`splash-overlay ${isVisible ? "splash-visible" : "splash-hidden"}`}
      role="status"
      aria-live="polite"
      aria-label={message || "Cargando..."}
    >
      <div className="splash-container">
        <div className="splash-background" />

        <div className="splash-content">
          <Mascot variant={variant} state={animationState} className="mascot-lg" />

          <h1 className="splash-title">Sefardlab</h1>
          <p className="splash-subtitle">Aprende hebreo, una letra a la vez</p>

          {message && <p className="splash-message">{message}</p>}

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
