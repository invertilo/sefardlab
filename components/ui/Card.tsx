import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "raised" | "flat" | "sunken";
type CardPadding = "none" | "sm" | "md" | "lg";

const variants: Record<CardVariant, string> = {
  raised: "bg-surface border border-border/70 shadow-1",
  flat: "bg-surface border border-border",
  sunken: "bg-surface-sunken",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-6 md:p-8",
};

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: "div" | "article" | "section";
  /** Superficie que reacciona al ratón (elevación suave). Solo transform y sombra. */
  interactive?: boolean;
};

export function Card({
  variant = "raised",
  padding = "md",
  as: Tag = "div",
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      data-icon-host={interactive ? "" : undefined}
      className={cn(
        "relative rounded-2xl",
        interactive &&
          "transition-[transform,box-shadow] duration-300 ease-out-soft motion-safe:hover:-translate-y-0.5 hover:shadow-2",
        variants[variant],
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-bold tracking-tight text-text md:text-2xl", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted", className)} {...props} />;
}
