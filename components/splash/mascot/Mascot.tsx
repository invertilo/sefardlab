import Image from "next/image";
import type { MascotVariant, AnimationState } from "./MascotTypes";
import "./mascot.css";

interface MascotProps {
  variant?: MascotVariant;
  state: AnimationState;
  className?: string;
}

// Only the classic sprite exists in the official pack; other variants fall back to it until their art is delivered.
const SPRITES: Partial<Record<MascotVariant, string>> = {
  classic: "/mascots/sefardlab/owl-classic-128.png",
};

export function Mascot({ variant = "classic", state, className = "" }: MascotProps) {
  const src = SPRITES[variant] ?? SPRITES.classic!;

  return (
    <div className={`mascot-container mascot-${state} ${className}`} data-variant={variant}>
      <div className="mascot-sprite-wrap">
        <Image
          src={src}
          alt="Búho de Sefardlab con kipá, gafas doradas y libro hebreo"
          width={128}
          height={128}
          unoptimized
          priority
          draggable={false}
          className="mascot-sprite"
        />
      </div>
      <div className="mascot-shadow" aria-hidden="true" />

      {state === "loading" && (
        <div className="mascot-loader" aria-hidden="true">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
      )}

      {state === "success" && (
        <div className="mascot-success-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="check-icon">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
      )}
    </div>
  );
}
