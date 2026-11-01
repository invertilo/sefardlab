import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./icon-motion.css";

export const iconNames = [
  "book",
  "star",
  "fire",
  "trophy",
  "settings",
  "lock",
  "check",
  "arrow",
  "x",
  "volume",
  "clock",
  "bolt",
  "calendar",
  "type",
  "waves",
  "target",
  "landmark",
  "graduation",
  "crown",
  "medal",
] as const;
export type IconName = (typeof iconNames)[number];

type IconProps = {
  name: IconName;
  /** Tamaño en px (los trazos están dibujados en una rejilla de 24px). */
  size?: number;
  /** Si se pasa, el icono se anuncia a lectores de pantalla. */
  label?: string;
  className?: string;
  /** `loop` mantiene una animación suave continua (fuego, brillo del trofeo). */
  motion?: "hover" | "loop" | "none";
};

/* Cada icono: trazos a 1.75px en rejilla de 24. Las clases `p`, `draw`, etc.
   son ganchos de icon-motion.css. */
const glyphs: Record<IconName, ReactNode> = {
  arrow: (
    <g className="p">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </g>
  ),
  book: (
    <g className="p">
      <path d="M12 6.5C10.4 5.2 8 4.5 4.5 4.5c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1 3.5 0 5.9.7 7.5 2 1.6-1.3 4-2 7.5-2 .6 0 1-.4 1-1v-12c0-.6-.4-1-1-1-3.5 0-5.9.7-7.5 2Z" />
      <path d="M12 6.5v14" />
    </g>
  ),
  check: <path className="draw" pathLength={1} d="m5 12.5 4.5 4.5L19 7.5" />,
  x: (
    <>
      <path className="draw" pathLength={1} d="M6 6l12 12" />
      <path className="draw draw-2" pathLength={1} d="M18 6 6 18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M10 2.5h4" />
      <path className="p hand" d="M12 9.5V13" />
      <path d="m12 13 2.5 2" />
    </>
  ),
  fire: (
    <>
      <path
        className="p flame"
        d="M12 21c-3.9 0-7-2.9-7-6.8 0-2.6 1.4-4.6 2.9-6.1.4-.4 1.1-.1 1.1.5 0 1.3.6 2.4 1.6 2.9C10.4 8 11.6 5.3 14 3.3c.4-.3 1-.1 1.1.4.4 2.2 1.6 3.6 2.8 5 1.2 1.4 2.1 3 2.1 5.4C20 18 16.4 21 12 21Z"
      />
      <path
        className="p flame-in"
        d="M12 21c-1.7 0-3-1.3-3-3 0-1.6 1.3-2.8 2.2-3.8.4-.4 1-.4 1.4 0 1 1 2.4 2.2 2.4 3.8 0 1.7-1.3 3-3 3Z"
      />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M12 14.5v2" />
      <path className="p shackle" d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  settings: (
    <g className="p">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </g>
  ),
  star: (
    <path
      className="p"
      d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.5Z"
    />
  ),
  trophy: (
    <>
      <g className="p cup">
        <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0V4Z" />
        <path d="M16.5 5.5h2.5a.5.5 0 0 1 .5.5v1A3.5 3.5 0 0 1 16 10.5" />
        <path d="M7.5 5.5H5a.5.5 0 0 0-.5.5v1A3.5 3.5 0 0 0 8 10.5" />
        <path d="M12 13.5V17" />
        <path d="M8.5 20.5h7" />
        <path d="M9.5 20.5c0-2 1-3.5 2.5-3.5s2.5 1.5 2.5 3.5" />
      </g>
      <g className="p spark" strokeWidth="1.5">
        <path d="M20.5 0.8v2.4" />
        <path d="M19.3 2h2.4" />
      </g>
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6.5 9H3.5v6h3L11 19V5Z" />
      <path className="w1" d="M15.5 9a4 4 0 0 1 0 6" />
      <path className="w2" d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  bolt: <path className="p" d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />,
  type: (
    <g className="p">
      <path d="M4.5 6.5V5h15v1.5" />
      <path d="M12 5v14" />
      <path d="M9 19h6" />
    </g>
  ),
  waves: (
    <g className="p">
      <path d="M2.5 9c1.7-1.6 3.4-1.6 5 0s3.3 1.6 5 0 3.4-1.6 5 0 3.3 1.6 5 0" />
      <path d="M2.5 14.5c1.7-1.6 3.4-1.6 5 0s3.3 1.6 5 0 3.4-1.6 5 0 3.3 1.6 5 0" />
      <path d="M2.5 20c1.7-1.6 3.4-1.6 5 0s3.3 1.6 5 0 3.4-1.6 5 0 3.3 1.6 5 0" />
    </g>
  ),
  target: (
    <g className="p">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </g>
  ),
  landmark: (
    <g className="p">
      <path d="M3.5 9.5 12 4l8.5 5.5" />
      <path d="M4.5 9.5h15" />
      <path d="M6.5 9.5V18M10.5 9.5V18M13.5 9.5V18M17.5 9.5V18" />
      <path d="M3.5 20.5h17" />
    </g>
  ),
  graduation: (
    <g className="p">
      <path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5-9.5-4.5Z" />
      <path d="M6.5 11.5V16c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.5" />
      <path d="M21.5 9.5v5" />
    </g>
  ),
  crown: (
    <g className="p">
      <path d="M3.5 8.5 7.5 13 12 6.5 16.5 13l4-4.5-1.5 10.5h-16L3.5 8.5Z" />
      <path d="M5.5 20.5h13" />
    </g>
  ),
  medal: (
    <g className="p">
      <path d="M8 3.5 11 9h2l3-5.5" />
      <circle cx="12" cy="15" r="5.5" />
      <path d="m12 12.5.8 1.7 1.8.2-1.4 1.1.4 1.8-1.6-.9-1.6.9.4-1.8-1.4-1.1 1.8-.2.8-1.7Z" />
    </g>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="3" />
      <path d="M4 10.5h16" />
      <path className="p tick" d="M8.5 3.5v3.5" />
      <path className="p tick" d="M15.5 3.5v3.5" />
    </>
  ),
};

/**
 * Icono de línea (rejilla 24, trazo 1.75) en SVG inline: hereda `currentColor`,
 * es decorativo salvo que se pase `label`, y se anima solo con transform,
 * opacity y stroke-dashoffset (ver icon-motion.css; respeta reduced motion).
 */
export function Icon({ name, size = 24, label, className, motion = "hover" }: IconProps) {
  const draws = name === "check" || name === "x";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("sl-icon inline-block shrink-0", className)}
      data-name={name}
      data-hover={motion !== "none" ? "" : undefined}
      data-loop={motion === "loop" ? "" : undefined}
      data-draw={draws && motion !== "none" ? "" : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {glyphs[name]}
    </svg>
  );
}
