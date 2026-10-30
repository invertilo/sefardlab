import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border-transparent bg-secondary text-on-secondary hover:bg-secondary-hover",
  accent: "border-transparent bg-accent-strong text-on-accent hover:brightness-95",
  outline:
    "border-border-strong bg-transparent text-text hover:border-primary hover:bg-primary-soft",
  ghost: "border-transparent bg-transparent text-text hover:bg-surface-sunken",
};

const sizes: Record<ButtonSize, string> = {
  // Todos los tamaños respetan un objetivo táctil mínimo de 44px salvo `sm` (36px, uso denso).
  sm: "min-h-9 px-3 text-sm rounded-lg",
  md: "min-h-11 px-5 text-base rounded-lg",
  lg: "min-h-13 px-7 text-lg rounded-xl",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 border-[1.5px] font-medium leading-none no-underline",
    "transition-[background-color,border-color,transform,filter] duration-150 ease-out-soft active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Botón del design system. Con `href` se renderiza como `next/link`. */
export function Button(props: ButtonProps) {
  const { variant, size, fullWidth, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, fullWidth, className });

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
