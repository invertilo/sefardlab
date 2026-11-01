import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/mascots/sefardlab/owl-classic-128.png"
      alt=""
      width={128}
      height={128}
      unoptimized
      priority
      className={cn("size-10 shrink-0", className)}
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
