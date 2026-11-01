import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "primary" | "secondary" | "accent" | "success";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-sunken text-text",
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-text",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant };

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-sm font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
