"use client";

import { useEffect, useRef, useState } from "react";
import { TIMELINES } from "@/lib/mascot/animations";
import { Mascot } from "./mascot/Mascot";
import type { MascotVariant, AnimationState } from "./mascot/MascotTypes";
import "./splash.css";

interface SplashScreenProps {
  isVisible: boolean;
  variant?: MascotVariant;
  message?: string;
  showProgress?: boolean;
}

type Phase = "hidden" | Extract<AnimationState, "enter" | "loading" | "success" | "exit">;

const ENTER_MS = TIMELINES.enter.duration;
const SUCCESS_MS = TIMELINES.happy.duration;
/** Debe cubrir la salida escalonada de splash.css (contenido → fondo → desenfoque). */
const EXIT_MS = 560;

/**
 * Fases: enter → loading → success → exit. `isVisible` lo controla
 * useSplashIntegration con el estado real de carga; aquí solo se coreografía.
 * Mientras cubre la pantalla marca `<html data-splash>` para que la entrada de
 * la página espere y se vea al disolverse el splash (ver globals.css).
 */
export function SplashScreen({ isVisible, variant = "classic", message, showProgress = false }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const previousVisibleRef = useRef(false);

  useEffect(() => {
    const wasVisible = previousVisibleRef.current;
    previousVisibleRef.current = isVisible;
    const schedule = (ms: number, next: Phase) => timers.current.push(setTimeout(() => setPhase(next), ms));

    if (!wasVisible && isVisible) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      schedule(0, "enter");
      schedule(ENTER_MS, "loading");
    } else if (wasVisible && !isVisible) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      schedule(0, "success");
      schedule(SUCCESS_MS, "exit");
      schedule(SUCCESS_MS + EXIT_MS, "hidden");
    }
  }, [isVisible]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const root = document.documentElement;
    if (phase === "hidden" || phase === "exit") delete root.dataset.splash;
    else root.dataset.splash = phase;
  }, [phase]);

  useEffect(() => () => void delete document.documentElement.dataset.splash, []);

  if (phase === "hidden") return null;

  const done = phase === "success" || phase === "exit";

  return (
    <div
      className={`splash-overlay ${phase === "exit" ? "splash-hidden" : "splash-visible"}`}
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label={message || "Cargando..."}
    >
      <div className="splash-backdrop" aria-hidden="true" />
      <div className="splash-surface" aria-hidden="true" />
      <div className="splash-background" aria-hidden="true" />

      <div className="splash-container">
        <div className="splash-content">
          <Mascot variant={variant} state={phase} className="mascot-lg" />

          <h1 className="splash-title">Sefardlab</h1>
          <p className="splash-subtitle">Aprende hebreo, una letra a la vez</p>

          {message && <p className="splash-message">{message}</p>}

          {showProgress && phase !== "enter" && (
            <div className="splash-progress" data-state={done ? "done" : "loading"} aria-hidden="true">
              <div className="progress-bar" />
              <div className="progress-fill" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
