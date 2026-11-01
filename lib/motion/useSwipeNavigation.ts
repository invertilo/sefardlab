"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animateSpring, animateTween, prefersReducedMotion } from "./spring";

export type SwipeDirection = "next" | "prev";

/**
 * - `available`: el gesto puede completar la navegación.
 * - `blocked`: existe el paso pero aún no se puede (p. ej. falta responder);
 *   el contenido se resiste y al soltar se llama a `onBlocked` para explicar por qué.
 * - `none`: no hay paso en esa dirección; solo resistencia elástica.
 */
export type SwipeAvailability = "available" | "blocked" | "none";

export type SwipeNavigationOptions = {
  getAvailability: (direction: SwipeDirection) => SwipeAvailability;
  onCommit: (direction: SwipeDirection) => void;
  onBlocked?: (direction: SwipeDirection) => void;
  enabled?: boolean;
};

/** Distancia antes de decidir si el gesto es horizontal o vertical. */
const INTENT_SLOP = 8;
/** Un gesto es horizontal solo si domina claramente sobre el vertical. */
const HORIZONTAL_BIAS = 1.15;
/** Fracción del ancho que completa el gesto sin necesidad de velocidad. */
const DISTANCE_THRESHOLD = 0.28;
/** px/ms: un gesto rápido y corto también cuenta. */
const VELOCITY_THRESHOLD = 0.45;
const MIN_FLICK_DISTANCE = 24;
const EXIT_MS = 140;
/** Desde dónde entra el paso nuevo, como fracción del ancho. */
const ENTER_OFFSET = 0.14;

const IGNORE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], audio, video, [data-no-swipe]';

/** Resistencia elástica tipo iOS: se mueve, pero cada vez menos. */
function rubberBand(offset: number, dimension: number, constant = 0.55): number {
  const sign = Math.sign(offset);
  const abs = Math.abs(offset);
  return sign * (1 - 1 / ((abs * constant) / dimension + 1)) * dimension;
}

function isInHorizontalScroller(target: Element, root: Element): boolean {
  for (let node: Element | null = target; node && node !== root; node = node.parentElement) {
    const { overflowX } = getComputedStyle(node);
    if ((overflowX === "auto" || overflowX === "scroll") && node.scrollWidth > node.clientWidth) return true;
  }
  return false;
}

/**
 * Navegación por pasos con deslizamiento horizontal: el contenido sigue al
 * dedo (o al puntero), y al soltar se asienta con un muelle. No toca el
 * desplazamiento vertical: el contenedor debe llevar `touch-action: pan-y`
 * (clase `touch-pan-y`) para que el navegador siga haciendo el scroll.
 *
 * Solo anima `transform` y `opacity`, y con prefers-reduced-motion el gesto
 * sigue funcionando pero sin movimiento.
 *
 * Es un atajo: cada acción debe tener también su botón visible.
 */
export function useSwipeNavigation(ref: RefObject<HTMLElement | null>, options: SwipeNavigationOptions) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const enabled = options.enabled ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const root: HTMLElement = el;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let intent: "horizontal" | "vertical" | null = null;
    let samples: { x: number; t: number }[] = [];
    let offset = 0;
    let width = 1;
    let reduced = false;
    let cancelAnimation: (() => void) | null = null;
    let pendingCommit: (() => void) | null = null;

    const isRtl = () => getComputedStyle(root).direction === "rtl";
    const directionFor = (dx: number): SwipeDirection => ((dx < 0) !== isRtl() ? "next" : "prev");

    function paint(x: number, opacity = 1) {
      offset = x;
      root.style.transform = x === 0 ? "" : `translate3d(${x}px, 0, 0)`;
      root.style.opacity = opacity === 1 ? "" : String(opacity);
    }

    function rest() {
      paint(0);
      root.style.willChange = "";
      root.style.userSelect = "";
      cancelAnimation = null;
    }

    function stopAnimation() {
      cancelAnimation?.();
      cancelAnimation = null;
      // Si se interrumpe la salida, la navegación ocurre igual: nunca se pierde un gesto completado.
      const commit = pendingCommit;
      pendingCommit = null;
      commit?.();
      rest();
    }

    function settle(velocityPxPerS = 0) {
      cancelAnimation = animateSpring(offset, 0, {
        velocity: velocityPxPerS,
        onUpdate: (x) => paint(x),
        onComplete: rest,
      });
    }

    function suppressNextClick() {
      // Un arrastre que empezó sobre un botón no debe pulsarlo al soltar.
      // Solo el clic real del navegador: el `.click()` de `onCommit` sí debe pasar.
      // Con tacto, un arrastre no genera clic: el bloqueo caduca para no comerse el siguiente toque.
      const release = () => {
        window.removeEventListener("click", block, { capture: true });
        window.removeEventListener("pointerdown", release, { capture: true });
        clearTimeout(timer);
      };
      const block = (event: MouseEvent) => {
        if (!event.isTrusted) return;
        event.preventDefault();
        event.stopPropagation();
        release();
      };
      const timer = setTimeout(release, 300);
      window.addEventListener("click", block, { capture: true });
      window.addEventListener("pointerdown", release, { capture: true });
      setTimeout(() => window.removeEventListener("click", block, { capture: true }), 0);
    }

    function onPointerDown(event: PointerEvent) {
      if (!event.isPrimary || pointerId !== null) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target as Element | null;
      if (!target || target.closest(IGNORE_SELECTOR) || isInHorizontalScroller(target, root)) return;

      if (cancelAnimation || pendingCommit) stopAnimation();

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      intent = null;
      samples = [{ x: event.clientX, t: event.timeStamp }];
      width = Math.max(root.getBoundingClientRect().width, 1);
      reduced = prefersReducedMotion();

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (intent === null) {
        if (Math.hypot(dx, dy) < INTENT_SLOP) return;
        intent = Math.abs(dx) > Math.abs(dy) * HORIZONTAL_BIAS ? "horizontal" : "vertical";
        if (intent === "vertical") {
          // El scroll vertical es del navegador: soltamos el gesto sin tocar nada.
          detach();
          return;
        }
        try {
          root.setPointerCapture(event.pointerId);
        } catch {
          // Algunos navegadores ya no tienen el puntero activo: seguimos con los listeners de window.
        }
        window.getSelection()?.removeAllRanges();
        root.style.userSelect = "none";
        if (!reduced) root.style.willChange = "transform";
      }

      samples.push({ x: event.clientX, t: event.timeStamp });
      if (samples.length > 6) samples.shift();
      if (reduced) return;

      const availability = optionsRef.current.getAvailability(directionFor(dx));
      paint(availability === "available" ? dx : rubberBand(dx, width));
    }

    function velocity(): number {
      const last = samples[samples.length - 1];
      const first = samples.find((s) => last.t - s.t <= 100) ?? samples[0];
      const dt = last.t - first.t;
      return dt > 0 ? (last.x - first.x) / dt : 0;
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      const wasHorizontal = intent === "horizontal";
      const dx = event.clientX - startX;
      const v = velocity();
      detach();
      if (!wasHorizontal) return;
      suppressNextClick();

      const direction = directionFor(dx);
      const { getAvailability, onCommit, onBlocked } = optionsRef.current;
      const availability = getAvailability(direction);
      const flick = Math.abs(v) > VELOCITY_THRESHOLD && Math.abs(dx) > MIN_FLICK_DISTANCE && Math.sign(v) === Math.sign(dx);
      const passed = Math.abs(dx) > width * DISTANCE_THRESHOLD || flick;
      // Un gesto que vuelve hacia atrás al final se interpreta como arrepentimiento.
      const reversed = Math.sign(v) !== 0 && Math.sign(v) !== Math.sign(dx) && Math.abs(v) > 0.2;

      if (!passed || reversed || availability === "none") {
        if (reduced) rest();
        else settle(v * 1000);
        return;
      }

      if (availability === "blocked") {
        onBlocked?.(direction);
        if (reduced) rest();
        else settle(v * 1000);
        return;
      }

      if (reduced) {
        rest();
        onCommit(direction);
        return;
      }

      const sign = Math.sign(dx) || -1;
      pendingCommit = () => onCommit(direction);
      cancelAnimation = animateTween(
        offset,
        sign * width * 0.4,
        EXIT_MS,
        (x, t) => paint(x, 1 - t),
        () => {
          const commit = pendingCommit;
          pendingCommit = null;
          commit?.();
          // El paso nuevo entra desde el lado contrario y se asienta con el impulso del gesto.
          const from = -sign * width * ENTER_OFFSET;
          paint(from, 0);
          const launch = sign * Math.min(Math.abs(v) * 1000, 2400);
          cancelAnimation = animateSpring(from, 0, {
            velocity: launch,
            onUpdate: (x) => paint(x, Math.max(0, Math.min(1, 1 - Math.abs(x) / (width * ENTER_OFFSET)))),
            onComplete: rest,
          });
        },
      );
    }

    function onPointerCancel(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      const wasHorizontal = intent === "horizontal";
      detach();
      if (wasHorizontal) {
        if (reduced) rest();
        else settle();
      }
    }

    function detach() {
      if (pointerId !== null && root.hasPointerCapture?.(pointerId)) root.releasePointerCapture(pointerId);
      pointerId = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
    }

    root.addEventListener("pointerdown", onPointerDown);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      detach();
      cancelAnimation?.();
      pendingCommit = null;
      rest();
    };
  }, [ref, enabled]);
}
