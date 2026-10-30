import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-accent-strong",
        "before:h-0.5 before:w-5 before:rounded-sm before:bg-current",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  id,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  id: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 flex max-w-2xl flex-col gap-4", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="text-3xl font-bold md:text-[2.75rem]">
        {title}
      </h2>
      {children && <p className="text-lg text-muted md:text-xl">{children}</p>}
    </div>
  );
}
