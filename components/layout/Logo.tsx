import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo búho de Sefardlab */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Logo Sefardlab"
      width={40}
      height={40}
      className={cn("size-10 shrink-0", className)}
      priority
    />
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
