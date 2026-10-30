import { cn } from "@/lib/utils";

/** Motivo de azulejo sefardí (estrella de ocho puntas) como fondo decorativo. */
export function TilePattern({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.25">
            <rect x="16" y="16" width="24" height="24" />
            <rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
            <circle cx="28" cy="28" r="4" />
            <path d="M0 0l8 8M56 0l-8 8M0 56l8-8M56 56l-8-8" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
