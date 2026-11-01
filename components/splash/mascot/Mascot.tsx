"use client";

import { useMemo } from "react";
import type { MascotVariant, AnimationState } from "./MascotTypes";
import "./mascot.css";

interface MascotProps {
  variant: MascotVariant;
  state: AnimationState;
  className?: string;
}

function OwlBase() {
  return (
    <g className="owl-base">
      {/* Body */}
      <rect x="70" y="110" width="60" height="70" fill="#A0704F" />

      {/* Chest/Face white area */}
      <rect x="80" y="120" width="40" height="50" fill="#F5EAD9" />

      {/* Head */}
      <rect x="75" y="45" width="50" height="65" fill="#A0704F" />

      {/* Head face white */}
      <rect x="85" y="55" width="30" height="45" fill="#F5EAD9" />

      {/* Eyes - Left */}
      <rect x="80" y="65" width="10" height="10" fill="white" />
      <rect x="82" y="67" width="6" height="6" fill="#F4A460" />
      <rect x="83" y="68" width="4" height="4" fill="#000" />
      <rect x="84" y="67" width="1" height="1" fill="white" />

      {/* Eyes - Right */}
      <rect x="110" y="65" width="10" height="10" fill="white" />
      <rect x="112" y="67" width="6" height="6" fill="#F4A460" />
      <rect x="113" y="68" width="4" height="4" fill="#000" />
      <rect x="114" y="67" width="1" height="1" fill="white" />

      {/* Glasses frames */}
      <rect x="78" y="63" width="14" height="14" fill="none" stroke="#E8B441" strokeWidth="2" />
      <rect x="108" y="63" width="14" height="14" fill="none" stroke="#E8B441" strokeWidth="2" />
      <rect x="92" y="70" width="16" height="2" fill="#E8B441" />

      {/* Beak */}
      <rect x="97" y="82" width="6" height="8" fill="#E8B441" />

      {/* Kipá (Hat) */}
      <rect x="75" y="35" width="50" height="12" fill="#1B4965" />
      <polygon points="95,33 100,25 105,33" fill="#1B4965" />

      {/* Kipá pattern - Star of David */}
      <g fill="#E8B441">
        <rect x="98" y="38" width="2" height="2" />
        <rect x="96" y="39" width="2" height="1" />
        <rect x="100" y="39" width="2" height="1" />
        <rect x="97" y="40" width="1" height="1" />
        <rect x="99" y="40" width="1" height="1" />
      </g>

      {/* Wings */}
      <rect x="68" y="125" width="6" height="20" fill="#8B6F47" />
      <rect x="126" y="125" width="6" height="20" fill="#8B6F47" />

      {/* Feet */}
      <rect x="82" y="180" width="8" height="8" fill="#F4A460" />
      <rect x="110" y="180" width="8" height="8" fill="#F4A460" />

      {/* Shadow */}
      <ellipse cx="100" cy="195" rx="35" ry="8" fill="#00000015" />
    </g>
  );
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
        aria-label={`Búho Sefardlab - Variante ${variant}`}
        role="img"
        style={{ imageRendering: "pixelated" }}
      >
        <OwlBase />

        {/* Variant-specific accessories */}
        {variant === "classic" && (
          <g className="variant-accessory">
            {/* Book with X */}
            <rect x="130" y="130" width="18" height="24" fill="#1B4965" rx="1" />
            <rect x="132" y="132" width="14" height="20" fill="#2D7AA8" rx="1" />
            <text
              x="139"
              y="143"
              fontSize="10"
              fontWeight="bold"
              fill="#E8B441"
              textAnchor="middle"
            >
              ✕
            </text>
          </g>
        )}

        {variant === "sefardi" && (
          <g className="variant-accessory">
            {/* Tallit */}
            <rect x="65" y="120" width="70" height="40" fill="#F5F5F5" opacity="0.8" />
            <line x1="75" y1="120" x2="75" y2="160" stroke="#1B4965" strokeWidth="1" />
            <line x1="85" y1="120" x2="85" y2="160" stroke="#1B4965" strokeWidth="1" />
            <line x1="95" y1="120" x2="95" y2="160" stroke="#1B4965" strokeWidth="1" />
            <line x1="105" y1="120" x2="105" y2="160" stroke="#1B4965" strokeWidth="1" />
            <line x1="115" y1="120" x2="115" y2="160" stroke="#1B4965" strokeWidth="1" />
            <line x1="125" y1="120" x2="125" y2="160" stroke="#1B4965" strokeWidth="1" />

            {/* Hebrew book */}
            <rect x="115" y="135" width="16" height="22" fill="#1B4965" rx="1" />
            <text
              x="123"
              y="147"
              fontSize="8"
              fontWeight="bold"
              fill="#E8B441"
              textAnchor="middle"
            >
              תורה
            </text>
          </g>
        )}

        {variant === "developer" && (
          <g className="variant-accessory">
            {/* Laptop screen */}
            <rect x="115" y="125" width="25" height="18" fill="#0a0e27" rx="1" />
            <line x1="120" y1="130" x2="133" y2="130" stroke="#00ff88" strokeWidth="1" />
            <line x1="120" y1="133" x2="135" y2="133" stroke="#00ff88" strokeWidth="1" />
            <line x1="120" y1="136" x2="130" y2="136" stroke="#00ff88" strokeWidth="1" />
            {/* Laptop base */}
            <rect x="116" y="143" width="23" height="2" fill="#2D3748" />
          </g>
        )}

        {variant === "student" && (
          <g className="variant-accessory">
            {/* Stack of books */}
            <rect x="125" y="155" width="12" height="6" fill="#8B4513" />
            <rect x="124" y="150" width="12" height="6" fill="#D2691E" />
            <rect x="123" y="145" width="12" height="6" fill="#CD853F" />
          </g>
        )}

        {variant === "master" && (
          <g className="variant-accessory">
            {/* Large Hebrew book (Torah) */}
            <rect x="118" y="128" width="20" height="26" fill="#1B4965" rx="1" />
            <rect x="120" y="130" width="16" height="22" fill="#2D7AA8" />
            <text
              x="128"
              y="142"
              fontSize="9"
              fontWeight="bold"
              fill="#E8B441"
              textAnchor="middle"
            >
              א
            </text>
          </g>
        )}

        {variant === "gamification" && (
          <g className="variant-accessory">
            {/* Trophy */}
            <polygon points="120,160 115,155 115,140 125,140 125,155" fill="#FFD700" />
            <rect x="117" y="160" width="6" height="4" fill="#FFD700" />
            <circle cx="120" cy="165" r="4" fill="#FFA500" />
            {/* Star sparkles */}
            <polygon points="135,135 137,140 142,140 138,144 140,149 135,145 130,149 132,144 128,140 133,140" fill="#FFD700" />
          </g>
        )}
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
