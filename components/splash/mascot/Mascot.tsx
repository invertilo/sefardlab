"use client";

import { useMemo } from "react";
import type { MascotVariant, AnimationState } from "./MascotTypes";
import "./mascot.css";

interface MascotProps {
  variant: MascotVariant;
  state: AnimationState;
  className?: string;
}

export function Mascot({ variant, state, className = "" }: MascotProps) {
  const animationClass = useMemo(
    () => `mascot-${variant} mascot-${state}`,
    [variant, state],
  );

  return (
    <div className={`mascot-container ${animationClass} ${className}`}>
      <svg
        viewBox="0 0 200 240"
        className="mascot-svg"
        aria-label="Búho Sefardlab"
        role="img"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        <ellipse cx="100" cy="130" rx="45" ry="55" fill="#8B5A3C" filter="url(#shadow)" />
        <ellipse cx="100" cy="135" rx="30" ry="40" fill="#F5E6D3" />
        <path d="M 60 120 Q 50 130 55 150 Q 60 140 65 135 Z" fill="#8B5A3C" className="owl-wing-left" />
        <path d="M 140 120 Q 150 130 145 150 Q 140 140 135 135 Z" fill="#8B5A3C" className="owl-wing-right" />
        <circle cx="85" cy="180" r="6" fill="#E8B441" />
        <circle cx="115" cy="180" r="6" fill="#E8B441" />

        <circle cx="100" cy="80" r="38" fill="#A66B56" filter="url(#shadow)" />
        <ellipse cx="100" cy="85" rx="28" ry="32" fill="#F5E6D3" />
        <path d="M 72 50 Q 68 40 70 25 Q 75 35 72 50 Z" fill="#8B5A3C" />
        <path d="M 128 50 Q 132 40 130 25 Q 125 35 128 50 Z" fill="#8B5A3C" />
        <circle cx="75" cy="90" r="8" fill="#F4A7A5" opacity="0.6" />
        <circle cx="125" cy="90" r="8" fill="#F4A7A5" opacity="0.6" />

        <circle cx="82" cy="78" r="10" fill="white" />
        <circle cx="83" cy="80" r="6" fill="#D4A574" />
        <circle cx="84" cy="80" r="3" fill="#1a1a1a" />
        <circle cx="85" cy="78" r="1.5" fill="white" />
        <circle cx="118" cy="78" r="10" fill="white" />
        <circle cx="117" cy="80" r="6" fill="#D4A574" />
        <circle cx="116" cy="80" r="3" fill="#1a1a1a" />
        <circle cx="115" cy="78" r="1.5" fill="white" />

        <circle cx="82" cy="78" r="12" fill="none" stroke="#E8B441" strokeWidth="2" />
        <circle cx="118" cy="78" r="12" fill="none" stroke="#E8B441" strokeWidth="2" />
        <line x1="94" y1="78" x2="106" y2="78" stroke="#E8B441" strokeWidth="2" />

        <g className="eyelids">
          <ellipse cx="82" cy="68" rx="11" ry="7" fill="#A66B56" />
          <ellipse cx="118" cy="68" rx="11" ry="7" fill="#A66B56" />
        </g>

        <path d="M 100 95 L 97 103 L 103 103 Z" fill="#E8B441" />
        <path d="M 72 45 Q 100 25 128 45 Q 120 55 100 60 Q 80 55 72 45 Z" fill="#1B4965" />
        <circle cx="100" cy="40" r="3" fill="#E8B441" />
        <circle cx="85" cy="48" r="2" fill="#E8B441" />
        <circle cx="115" cy="48" r="2" fill="#E8B441" />
      </svg>

      {state === "loading" && (
        <div className="mascot-loader">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      )}

      {state === "success" && (
        <div className="mascot-success-indicator">
          <svg viewBox="0 0 24 24" className="check-icon">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
      )}
    </div>
  );
}
