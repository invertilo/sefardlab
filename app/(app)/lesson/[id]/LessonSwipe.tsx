"use client";

import { useRef, type ReactNode } from "react";
import { useSwipeNavigation, type SwipeAvailability } from "@/lib/motion/useSwipeNavigation";

/**
 * Etiquetas del control que avanza al paso siguiente en cada etapa de
 * `LessonPlayer` (teoría → ejercicio → resumen). Un `data-swipe="next"` en el
 * propio control tiene prioridad sobre esta lista.
 */
const NEXT_LABELS = ["Empezar ejercicios", "Completar lección", "Siguiente", "Terminar lección", "Siguiente lección", "Ver mi panel"];

function findNextControl(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  const tagged = root.querySelector<HTMLElement>('[data-swipe="next"]');
  if (tagged) return tagged;
  const controls = root.querySelectorAll<HTMLElement>("button, a[href]");
  for (const control of controls) {
    const label = control.textContent?.trim();
    if (label && NEXT_LABELS.includes(label)) return control;
  }
  return null;
}

function availabilityOf(control: HTMLElement | null): SwipeAvailability {
  if (!control || (control instanceof HTMLButtonElement && control.disabled)) return "none";
  return control.getAttribute("aria-disabled") === "true" ? "blocked" : "available";
}

/**
 * Deslizar a la izquierda equivale a pulsar el botón visible de avanzar
 * («Siguiente», «Terminar lección», «Siguiente lección»...), que sigue siendo
 * el camino con teclado y lector de pantalla. Si aún no se puede avanzar, el
 * contenido se resiste y al soltar se pulsa igualmente para que aparezca la pista.
 * La lección no tiene paso anterior: hacia la derecha solo hay resistencia.
 */
export function LessonSwipe({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useSwipeNavigation(ref, {
    getAvailability: (direction) => (direction === "next" ? availabilityOf(findNextControl(ref.current)) : "none"),
    onCommit: () => findNextControl(ref.current)?.click(),
    onBlocked: () => findNextControl(ref.current)?.click(),
  });

  return (
    <div ref={ref} className="touch-pan-y">
      {children}
    </div>
  );
}
