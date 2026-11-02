"use client";

import { useEffect, useState } from "react";
import { loadMascotLayers } from "@/lib/mascot/renderer";
import { SplashFallback } from "./SplashFallback";

const MIN_VISIBLE_MS = 1100;
const MAX_VISIBLE_MS = 6000;
const EXIT_MS = 560;

/**
 * Splash de la landing. Se pinta en el HTML inicial (sin esperar a la
 * hidratación) y se disuelve cuando la tipografía y las capas del búho están
 * listas, con un mínimo para que se aprecie y un máximo por si la red falla.
 */
export function LandingSplash() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "gone">("visible");

  useEffect(() => {
    const startedAt = performance.now();
    let cancelled = false;

    const exitAfter = (ms: number) => {
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("exiting");
        window.setTimeout(() => !cancelled && setPhase("gone"), EXIT_MS);
      }, ms);
    };

    const ready = Promise.allSettled([document.fonts.ready, loadMascotLayers()]);
    void ready.then(() => exitAfter(Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt))));
    const safety = window.setTimeout(() => {
      if (!cancelled) exitAfter(0);
    }, MAX_VISIBLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  if (phase === "gone") return null;
  return <SplashFallback message="Bienvenido a Sefardlab" immediate exiting={phase === "exiting"} />;
}
