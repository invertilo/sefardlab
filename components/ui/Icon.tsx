import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

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
] as const;
export type IconName = (typeof iconNames)[number];

type IconProps = {
  name: IconName;
  /** Tamaño en px (los SVG están dibujados a 24px). */
  size?: number;
  /** Si se pasa, el icono se anuncia a lectores de pantalla. */
  label?: string;
  className?: string;
};

/**
 * Pinta un SVG de /public/icons usando CSS mask, así hereda `currentColor`
 * y responde al tema claro/oscuro sin duplicar los trazos en JSX.
 */
export function Icon({ name, size = 24, label, className }: IconProps) {
  const url = `url(/icons/${name}.svg)`;
  const style: CSSProperties = {
    width: size,
    height: size,
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };
  return (
    <span
      className={cn("inline-block shrink-0 bg-current", className)}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
