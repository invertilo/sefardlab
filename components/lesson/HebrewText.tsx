import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const HEBREW_CHAR = /[֐-׿יִ-ﭏ]/;

/** true si el texto contiene caracteres hebreos. */
export function isHebrew(text: string): boolean {
  return HEBREW_CHAR.test(text);
}

type Size = "sm" | "md" | "lg" | "xl" | "auto";

const sizes: Record<Exclude<Size, "auto">, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl sm:text-5xl",
  xl: "text-5xl sm:text-6xl",
};

/** Tamaño según la longitud: letras sueltas grandes, frases legibles sin desbordar. */
function autoSize(text: string): string {
  const length = [...text].length;
  if (length <= 4) return sizes.xl;
  if (length <= 10) return sizes.lg;
  if (length <= 24) return "text-3xl sm:text-4xl";
  return "text-2xl sm:text-3xl";
}

type HebrewTextProps = Omit<HTMLAttributes<HTMLElement>, "dir" | "lang" | "children"> & {
  children: string;
  size?: Size;
  as?: "span" | "p" | "div";
};

/**
 * Texto hebreo con dirección RTL, idioma y tipografía correctos. Así los
 * lectores de pantalla cambian de voz y el nikud (vocales) se pinta bien.
 */
export function HebrewText({ children, size = "auto", as: Tag = "span", className, ...props }: HebrewTextProps) {
  return (
    <Tag
      lang="he"
      dir="rtl"
      className={cn(
        "font-hebrew font-bold leading-[1.6] text-text [overflow-wrap:anywhere]",
        size === "auto" ? autoSize(children) : sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
