import Link from "next/link";
import { cn } from "@/lib/utils";

/** Arco sefardí: marca de Sefardlab. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={cn("size-8 shrink-0", className)} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 28V14C4 7.4 9.4 2 16 2s12 5.4 12 12v14Z" fill="var(--primary)" />
      <path d="M9 28V15a7 7 0 0 1 14 0v13" fill="none" stroke="#E8B441" strokeWidth="2" />
      <circle cx="16" cy="13" r="2.5" fill="#D85C3E" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label="Sefardlab, inicio"
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 font-display text-lg font-bold tracking-tight text-text no-underline",
        className,
      )}
    >
      <LogoMark />
      Sefardlab
    </Link>
  );
}
