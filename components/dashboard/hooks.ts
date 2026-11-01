"use client";

import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Anima un número desde su valor anterior (0 la primera vez) hasta `value`.
 * Con prefers-reduced-motion salta directamente al valor final.
 */
export function useCountUp(value: number, duration = 900): number {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    const total = prefersReducedMotion() ? 0 : duration;
    let raf = 0;

    const tick = (t: number) => {
      const p = total === 0 ? 1 : Math.min((t - start) / total, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(origin + (value - origin) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);

  return display;
}

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Modo privado o almacenamiento bloqueado: solo perdemos la animación.
  }
}

/**
 * Devuelve el valor que tenía `key` en la visita anterior (de este navegador)
 * y guarda el actual. Sirve para animar solo lo que cambió desde entonces.
 * Solo se monta en el cliente (los datos llegan tras cargar /api/user/stats).
 */
export function usePreviousVisit<T>(key: string, current: T): T | null {
  const [previous] = useState<T | null>(() => (typeof window === "undefined" ? null : readStorage<T>(key)));

  useEffect(() => {
    writeStorage(key, current);
  }, [key, current]);

  return previous;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es");
}
