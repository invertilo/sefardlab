import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Ancho máximo 72rem con gutter de 16px en móvil, 32px en tablet, 40px en desktop. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[calc(72rem+5rem)] px-4 md:px-8 lg:px-10", className)}
      {...props}
    />
  );
}
