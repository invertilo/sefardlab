/** Mismo criterio que el resto del código: `(prefers-reduced-motion: reduce)`. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export type SpringOptions = {
  /** Rigidez (N/m con masa 1). Más alta = más rápido. */
  stiffness?: number;
  /** 1 = crítico, sin rebote; < 1 deja un rebote apenas perceptible. */
  dampingRatio?: number;
  /** Velocidad inicial en px/s (p. ej. la del gesto al soltar). */
  velocity?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

/**
 * Muelle amortiguado resuelto paso a paso en requestAnimationFrame.
 * Devuelve una función para cancelarlo (el gesto siguiente siempre manda).
 */
export function animateSpring(
  from: number,
  to: number,
  { stiffness = 420, dampingRatio = 0.86, velocity = 0, onUpdate, onComplete }: SpringOptions,
): () => void {
  const damping = 2 * dampingRatio * Math.sqrt(stiffness);
  let x = from;
  let v = velocity;
  let last = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    // Paso acotado: una pestaña en segundo plano no debe hacer saltar el muelle.
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const a = -stiffness * (x - to) - damping * v;
      v += (a * dt) / steps;
      x += (v * dt) / steps;
    }
    if (Math.abs(x - to) < 0.4 && Math.abs(v) < 8) {
      onUpdate(to);
      onComplete?.();
      return;
    }
    onUpdate(x);
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Interpolación con curva ease-in para salidas cortas (el contenido se va). */
export function animateTween(
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (value: number, progress: number) => void,
  onComplete?: () => void,
): () => void {
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const t = Math.min((now - start) / durationMs, 1);
    const eased = t * t * t; // cubic ease-in
    onUpdate(from + (to - from) * eased, t);
    if (t < 1) frame = requestAnimationFrame(tick);
    else onComplete?.();
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
