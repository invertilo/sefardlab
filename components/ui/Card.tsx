import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "raised" | "flat" | "sunken";
type CardPadding = "none" | "sm" | "md" | "lg";

const variants: Record<CardVariant, string> = {
  raised: "bg-surface border border-border shadow-1",
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
};

export function Card({
  variant = "raised",
  padding = "md",
  as: Tag = "div",
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn("relative rounded-2xl", variants[variant], paddings[padding], className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-bold text-text md:text-2xl", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted", className)} {...props} />;
}
