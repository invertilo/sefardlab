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
        {/* Definiciones de sombra */}
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
          </filter>
          <style>{`
            @keyframes blink {
              0%, 85%, 100% { opacity: 1; }
              90%, 95% { opacity: 0; }
            }
            @keyframes breathe {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-2px); }
            }
            @keyframes nod {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(2deg); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-4px) scale(1.02); }
            }
            @keyframes blink-state { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </defs>

        {/* Body/Torso - Marrón oscuro */}
        <ellipse cx="100" cy="130" rx="45" ry="55" fill="#8B5A3C" filter="url(#shadow)" />

        {/* Breast/Chest - Crema */}
        <ellipse cx="100" cy="135" rx="30" ry="40" fill="#F5E6D3" />

        {/* Ala izquierda */}
        <path
          d="M 60 120 Q 50 130 55 150 Q 60 140 65 135 Z"
          fill="#8B5A3C"
          className="owl-wing-left"
        />

        {/* Ala derecha */}
        <path
          d="M 140 120 Q 150 130 145 150 Q 140 140 135 135 Z"
          fill="#8B5A3C"
          className="owl-wing-right"
        />

        {/* Patas */}
        <circle cx="85" cy="180" r="6" fill="#E8B441" />
        <circle cx="115" cy="180" r="6" fill="#E8B441" />

        {/* Head */}
        <circle cx="100" cy="80" r="38" fill="#A66B56" filter="url(#shadow)" />

        {/* Head center - Crema */}
        <ellipse cx="100" cy="85" rx="28" ry="32" fill="#F5E6D3" />

        {/* Oreja/mechón izquierdo */}
        <path
          d="M 72 50 Q 68 40 70 25 Q 75 35 72 50 Z"
          fill="#8B5A3C"
        />

        {/* Oreja/mechón derecho */}
        <path
          d="M 128 50 Q 132 40 130 25 Q 125 35 128 50 Z"
          fill="#8B5A3C"
        />

        {/* Mejillas - Rosado */}
        <circle cx="75" cy="90" r="8" fill="#F4A7A5" opacity="0.6" />
        <circle cx="125" cy="90" r="8" fill="#F4A7A5" opacity="0.6" />

        {/* Ojo izquierdo - Blanco */}
        <circle cx="82" cy="78" r="10" fill="white" />
        {/* Iris izquierdo */}
        <circle cx="83" cy="80" r="6" fill="#D4A574" />
        {/* Pupila izquierda */}
        <circle cx="84" cy="80" r="3" fill="#1a1a1a" />
        {/* Reflejo izquierdo */}
        <circle cx="85" cy="78" r="1.5" fill="white" />

        {/* Ojo derecho - Blanco */}
        <circle cx="118" cy="78" r="10" fill="white" />
        {/* Iris derecho */}
        <circle cx="117" cy="80" r="6" fill="#D4A574" />
        {/* Pupila derecha */}
        <circle cx="116" cy="80" r="3" fill="#1a1a1a" />
        {/* Reflejo derecho */}
        <circle cx="115" cy="78" r="1.5" fill="white" />

        {/* Gafas - Marco dorado */}
        <circle cx="82" cy="78" r="12" fill="none" stroke="#E8B441" strokeWidth="2" />
        <circle cx="118" cy="78" r="12" fill="none" stroke="#E8B441" strokeWidth="2" />
        {/* Puente de gafas */}
        <line x1="94" y1="78" x2="106" y2="78" stroke="#E8B441" strokeWidth="2" />

        {/* Párpados - Para animación de parpadeo */}
        <g className="eyelids">
          <ellipse cx="82" cy="68" rx="11" ry="7" fill="#A66B56" />
          <ellipse cx="118" cy="68" rx="11" ry="7" fill="#A66B56" />
        </g>

        {/* Pico - Amarillo dorado */}
        <path
          d="M 100 95 L 97 103 L 103 103 Z"
          fill="#E8B441"
        />

        {/* Kipá - Azul marino */}
        <path
          d="M 72 45 Q 100 25 128 45 Q 120 55 100 60 Q 80 55 72 45 Z"
          fill="#1B4965"
        />

        {/* Detalles de Kipá - Patrón dorado */}
        <circle cx="100" cy="40" r="3" fill="#E8B441" />
        <circle cx="85" cy="48" r="2" fill="#E8B441" />
        <circle cx="115" cy="48" r="2" fill="#E8B441" />

        {/* Elementos específicos por variante */}
        {(variant === "classic" || variant === "student") && (
          <>
            {/* Libro - Azul con detalles dorados */}
            <rect x="55" y="145" width="20" height="25" fill="#1B4965" rx="2" />
            <rect x="55" y="148" width="20" height="2" fill="#E8B441" />
            {/* Alef en el libro */}
            <text
              x="65"
              y="165"
              fontSize="10"
              fill="#E8B441"
              textAnchor="middle"
              fontWeight="bold"
            >
              א
            </text>
          </>
        )}

        {variant === "sefardi" && (
          <>
            {/* Talit - Blanco con franjas azules */}
            <path
              d="M 65 95 Q 60 130 70 160 L 130 160 Q 140 130 135 95 Z"
              fill="white"
              opacity="0.9"
            />
            {/* Franjas del talit */}
            <line x1="80" y1="95" x2="85" y2="160" stroke="#1B4965" strokeWidth="2" />
            <line x1="100" y1="95" x2="100" y2="160" stroke="#1B4965" strokeWidth="2" />
            <line x1="120" y1="95" x2="115" y2="160" stroke="#1B4965" strokeWidth="2" />
            {/* Flecos */}
            <line x1="75" y1="160" x2="72" y2="175" stroke="#E8B441" strokeWidth="1" />
            <line x1="85" y1="160" x2="85" y2="175" stroke="#E8B441" strokeWidth="1" />
            <line x1="115" y1="160" x2="115" y2="175" stroke="#E8B441" strokeWidth="1" />
            <line x1="125" y1="160" x2="128" y2="175" stroke="#E8B441" strokeWidth="1" />
          </>
        )}

        {variant === "developer" && (
          <>
            {/* Laptop */}
            <rect x="55" y="140" width="25" height="18" fill="#1B4965" rx="1" />
            <rect x="55" y="159" width="28" height="4" fill="#E8B441" />
            {/* Código en pantalla */}
            <line x1="60" y1="148" x2="75" y2="148" stroke="#7fb3d5" strokeWidth="1" />
            <line x1="60" y1="152" x2="73" y2="152" stroke="#7fb3d5" strokeWidth="1" />
            <line x1="60" y1="156" x2="70" y2="156" stroke="#7fb3d5" strokeWidth="1" />
          </>
        )}

        {variant === "master" && (
          <>
            {/* Talit - Similar a sefardi pero con más formalidad */}
            <path
              d="M 65 100 Q 60 135 70 165 L 130 165 Q 140 135 135 100 Z"
              fill="white"
              opacity="0.95"
            />
            {/* Franjas */}
            <line x1="80" y1="100" x2="85" y2="165" stroke="#1B4965" strokeWidth="2.5" />
            <line x1="120" y1="100" x2="115" y2="165" stroke="#1B4965" strokeWidth="2.5" />
            {/* Libro de Torah - Azul oscuro con detalles dorados */}
            <rect x="45" y="135" width="18" height="30" fill="#102A43" rx="2" />
            <rect x="47" y="140" width="14" height="2" fill="#E8B441" />
            <rect x="47" y="153" width="14" height="2" fill="#E8B441" />
            <text
              x="54"
              y="162"
              fontSize="12"
              fill="#E8B441"
              textAnchor="middle"
              fontWeight="bold"
            >
              תורה
            </text>
          </>
        )}

        {variant === "gamification" && (
          <>
            {/* Mochila */}
            <rect x="130" y="110" width="22" height="28" fill="#1B4965" rx="2" />
            <rect x="135" y="108" width="12" height="3" fill="#E8B441" />
            {/* Trofeo/estrella en la mochila */}
            <circle cx="141" cy="125" r="5" fill="#FFD700" />
          </>
        )}
      </svg>

      {/* Indicador de carga indeterminado */}
      {state === "loading" && (
        <div className="mascot-loader">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      )}

      {/* Indicador de éxito */}
      {state === "success" && (
        <div className="mascot-success-indicator">
          <svg viewBox="0 0 24 24" className="check-icon">
            <path
              fill="currentColor"
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
