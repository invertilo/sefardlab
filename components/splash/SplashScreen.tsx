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
const EXIT_MS = 400;

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

  if (phase === "hidden") return null;

  return (
    <div
      className={`splash-overlay ${phase === "exit" ? "splash-hidden" : "splash-visible"}`}
      role="status"
      aria-live="polite"
      aria-label={message || "Cargando..."}
    >
      <div className="splash-container">
        <div className="splash-background" />

        <div className="splash-content">
          <Mascot variant={variant} state={phase} className="mascot-lg" />

          <h1 className="splash-title">Sefardlab</h1>
          <p className="splash-subtitle">Aprende hebreo, una letra a la vez</p>

          {message && <p className="splash-message">{message}</p>}

          {showProgress && phase === "loading" && (
            <div className="splash-progress">
              <div className="progress-bar" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
