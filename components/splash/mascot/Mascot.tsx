"use client";

import { AnimatedMascot, type AmbientMode } from "@/components/mascot/AnimatedMascot";
import type { MascotAnimationState } from "@/lib/mascot/animations";
import type { MascotVariant, AnimationState } from "./MascotTypes";
import "./mascot.css";

interface MascotProps {
  // Only the classic art exists in the official pack; other variants render it until theirs is delivered.
  variant?: MascotVariant;
  state: AnimationState;
  className?: string;
}

const ACTION: Record<AnimationState, MascotAnimationState> = {
  idle: "idle",
  enter: "enter",
  loading: "idle",
  success: "happy",
  exit: "exit",
  error: "doubt",
};

const AMBIENT: Record<AnimationState, AmbientMode> = {
  idle: "lively",
  enter: "none",
  loading: "calm",
  success: "none",
  exit: "none",
  error: "none",
};

export function Mascot({ variant = "classic", state, className = "" }: MascotProps) {
  return (
    <div
      className={`mascot-container mascot-${state} ${className}`}
      data-variant={variant}
      role="img"
      aria-label="Búho de Sefardlab con kipá, gafas doradas y libro hebreo"
    >
      <div className="mascot-sprite-wrap">
        <div className="mascot-breath">
          <AnimatedMascot action={ACTION[state]} ambient={AMBIENT[state]} />
        </div>
      </div>
      <div className="mascot-shadow" aria-hidden="true" />

      {state === "loading" && (
        <div className="mascot-loader" aria-hidden="true">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
      )}
    </div>
  );
}
