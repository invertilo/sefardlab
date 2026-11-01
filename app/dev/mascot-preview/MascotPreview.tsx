"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedMascot, type AmbientMode, type MascotStats } from "@/components/mascot/AnimatedMascot";
import { NEUTRAL, TIMELINES, sampleTimeline, type MascotAction, type MascotAnimationState } from "@/lib/mascot/animations";
import { MascotRenderer, loadMascotLayers } from "@/lib/mascot/renderer";
import { useSplash } from "@/hooks/useSplash";
import "@/components/splash/mascot/mascot.css";

const ACTIONS: MascotAnimationState[] = [
  "idle",
  "blink",
  "look-left",
  "look-right",
  "reading",
  "teaching",
  "happy",
  "doubt",
  "enter",
  "exit",
];

const KEY_FRAMES: { label: string; state: MascotAction | null; at: number }[] = [
  { label: "Reposo", state: null, at: 0 },
  { label: "Parpadeo ½", state: "blink", at: 10 },
  { label: "Parpadeo cerrado", state: "blink", at: 60 },
  { label: "Mira izquierda", state: "look-left", at: 100 },
  { label: "Mira derecha", state: "look-right", at: 100 },
  { label: "Lee: mira libro", state: "reading", at: 300 },
  { label: "Página 1", state: "reading", at: 700 },
  { label: "Página 2", state: "reading", at: 780 },
  { label: "Página 3", state: "reading", at: 870 },
  { label: "Enseña: alza", state: "teaching", at: 200 },
  { label: "Enseña: señala", state: "teaching", at: 500 },
  { label: "Alegría", state: "happy", at: 150 },
  { label: "Alegría 2", state: "happy", at: 250 },
  { label: "Duda", state: "doubt", at: 600 },
];

function KeyFrameStrip() {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    let alive = true;
    loadMascotLayers().then((layers) => {
      if (!alive) return;
      const renderer = new MascotRenderer(layers);
      KEY_FRAMES.forEach((f, i) => {
        const ctx = refs.current[i]?.getContext("2d");
        if (!ctx) return;
        const pose = f.state ? sampleTimeline(TIMELINES[f.state], f.at) : NEUTRAL;
        ctx.putImageData(renderer.compose(pose), 0, 0);
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {KEY_FRAMES.map((f, i) => (
        <figure key={f.label} className="flex flex-col items-center gap-1 rounded-lg bg-surface-sunken p-2">
          <canvas
            ref={(el) => {
              refs.current[i] = el;
            }}
            width={128}
            height={128}
            className="w-full max-w-[128px] [image-rendering:pixelated]"
          />
          <figcaption className="text-center text-xs text-muted">{f.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function SplashTrigger() {
  const { show, hide } = useSplash();
  return (
    <button
      type="button"
      data-testid="simulate-splash"
      onClick={() => {
        show({ message: "Preparando tu lección…", showProgress: true });
        setTimeout(hide, 1200);
      }}
      className="min-h-11 self-start rounded-lg bg-primary px-4 font-medium text-on-primary"
    >
      Simular Splash Screen (como al navegar)
    </button>
  );
}

export function MascotPreview() {
  const [action, setAction] = useState<MascotAnimationState>("idle");
  const [actionId, setActionId] = useState(0);
  const [ambient, setAmbient] = useState<AmbientMode>("none");
  const [scale, setScale] = useState(3);
  const [stats, setStats] = useState<MascotStats | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const play = (next: MascotAnimationState) => {
    setAction(next);
    setActionId((n) => n + 1);
    setLog((l) => [`▶ ${next}`, ...l].slice(0, 8));
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Mascota: banco de pruebas</h1>
        <p className="text-muted">Solo en desarrollo. Cada botón reproduce un estado aislado del motor.</p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <div
          className="mascot-container mx-auto"
          style={{ ["--mascot-scale" as string]: scale }}
          data-testid="mascot-stage"
        >
          <div className="mascot-sprite-wrap">
            <AnimatedMascot
              action={action}
              actionId={actionId}
              ambient={ambient}
              onStats={setStats}
              onActionEnd={(a) => {
                setAction("idle");
                setLog((l) => [`■ ${a} terminó`, ...l].slice(0, 8));
              }}
            />
          </div>
          <div className="mascot-shadow" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a}
                type="button"
                data-action={a}
                onClick={() => play(a)}
                aria-pressed={action === a}
                className="min-h-11 rounded-lg border border-border px-4 font-medium hover:bg-surface-sunken aria-pressed:bg-primary aria-pressed:text-on-primary"
              >
                {a}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              Ambiente
              <select
                value={ambient}
                onChange={(ev) => setAmbient(ev.target.value as AmbientMode)}
                className="min-h-11 rounded-lg border border-border bg-surface px-2"
              >
                <option value="none">ninguno (aislado)</option>
                <option value="calm">calmado</option>
                <option value="lively">animado</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Escala
              <select
                value={scale}
                onChange={(ev) => setScale(Number(ev.target.value))}
                className="min-h-11 rounded-lg border border-border bg-surface px-2"
              >
                {[1, 2, 3, 4].map((s) => (
                  <option key={s} value={s}>
                    {s}× ({128 * s}px)
                  </option>
                ))}
              </select>
            </label>
            <output data-testid="mascot-stats" className="font-mono">
              {stats ? `${stats.fps} fps (rAF) · ${stats.draws} redibujos/s` : "midiendo…"}
            </output>
          </div>

          <SplashTrigger />

          <ol className="font-mono text-sm text-muted" aria-label="Registro">
            {log.map((l, i) => (
              <li key={`${l}-${i}`}>{l}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Fotogramas clave (mismo motor, poses congeladas)</h2>
        <KeyFrameStrip />
      </section>
    </main>
  );
}
