"use client";

import { useState } from "react";
import { useSplash } from "@/hooks/useSplash";
import type { MascotVariant } from "./mascot/MascotTypes";

const VARIANTS: Array<{ id: MascotVariant; label: string }> = [
  { id: "classic", label: "Clásico" },
  { id: "sefardi", label: "Estilo Sefardí" },
  { id: "developer", label: "Desarrollador" },
  { id: "student", label: "Estudiante" },
  { id: "master", label: "Maestro/Rabínico" },
  { id: "gamification", label: "Gamificación" },
];

/**
 * Componente para testing de todas las variantes del Splash Screen.
 * Útil durante desarrollo para verificar animaciones.
 *
 * Uso: <SplashShowcase /> en cualquier página de desarrollo.
 */
export function SplashShowcase() {
  const { show, hide } = useSplash();
  const [selectedVariant, setSelectedVariant] = useState<MascotVariant>("classic");

  const handleShow = () => {
    show({
      variant: selectedVariant,
      message: `Cargando variante: ${selectedVariant}...`,
      showProgress: true,
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">Splash Screen Showcase</h2>

      <div className="flex gap-2 flex-wrap">
        {VARIANTS.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariant(variant.id)}
            className={`px-4 py-2 rounded border transition-colors ${
              selectedVariant === variant.id
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary"
            }`}
          >
            {variant.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleShow}
          className="px-4 py-2 bg-secondary text-black rounded hover:bg-secondary/80"
        >
          Mostrar Splash
        </button>
        <button
          onClick={hide}
          className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary/5"
        >
          Ocultar Splash
        </button>
      </div>

      <div className="p-4 bg-surface rounded border border-border text-sm">
        <p>Selecciona una variante y haz clic en &quot;Mostrar Splash&quot; para ver la animación.</p>
        <p className="mt-2 text-muted">
          La pantalla desaparecerá automáticamente después de 3 segundos o cuando hagas clic en &quot;Ocultar&quot;.
        </p>
      </div>
    </div>
  );
}
