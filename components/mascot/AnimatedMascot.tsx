"use client";

import { useEffect, useRef, useState } from "react";
import {
  AMBIENT_TILT,
  BREATH_PERIOD,
  NEUTRAL,
  TIMELINES,
  applyPatch,
  poseKey,
  sampleBlink,
  sampleTimeline,
  type MascotAction,
  type MascotAnimationState,
  type Pose,
  type Timeline,
} from "@/lib/mascot/animations";
import { MascotRenderer, loadMascotLayers } from "@/lib/mascot/renderer";
import { MASCOT_SIZE } from "@/lib/mascot/spriteManifest";

export type AmbientMode = "calm" | "lively" | "none";

export interface MascotStats {
  fps: number;
  draws: number;
}

interface AnimatedMascotProps {
  action?: MascotAnimationState;
  /** Change it to replay the same action. */
  actionId?: number;
  ambient?: AmbientMode;
  onActionEnd?: (action: MascotAnimationState) => void;
  onStats?: (stats: MascotStats) => void;
}

const AMBIENT_POOL: Record<Exclude<AmbientMode, "none">, Timeline[]> = {
  calm: [TIMELINES["look-left"], TIMELINES["look-right"], AMBIENT_TILT],
  lively: [TIMELINES["look-left"], TIMELINES["look-right"], AMBIENT_TILT, TIMELINES.reading, TIMELINES.teaching],
};

const between = (min: number, max: number) => min + Math.random() * (max - min);

export function AnimatedMascot({ action = "idle", actionId = 0, ambient = "calm", onActionEnd, onStats }: AnimatedMascotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const engine = useRef({
    renderer: null as MascotRenderer | null,
    requested: null as { name: MascotAction; start: number } | null,
    auto: null as { timeline: Timeline; start: number } | null,
    nextAutoAt: 0,
    blinkStart: -1,
    nextBlinkAt: 0,
    lastKey: "",
    reduced: false,
  });
  const callbacks = useRef({ onActionEnd, onStats, ambient });

  useEffect(() => {
    callbacks.current = { onActionEnd, onStats, ambient };
  });

  useEffect(() => {
    const e = engine.current;
    e.requested = action === "idle" ? null : { name: action, start: -1 };
    e.auto = null;
    e.lastKey = "";
  }, [action, actionId]);

  useEffect(() => {
    const e = engine.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    e.reduced = motion.matches;
    const onMotion = () => {
      e.reduced = motion.matches;
      e.lastKey = "";
    };
    motion.addEventListener("change", onMotion);

    let raf = 0;
    let stillTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let frames = 0;
    let draws = 0;
    let statsFrom = 0;

    const draw = (pose: Pose) => {
      const key = poseKey(pose);
      if (key === e.lastKey || !e.renderer) return;
      e.lastKey = key;
      ctx.putImageData(e.renderer.compose(pose), 0, 0);
      draws++;
    };

    const finishRequested = () => {
      const name = e.requested?.name;
      e.requested = null;
      if (name) callbacks.current.onActionEnd?.(name);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const { ambient: mode, onStats: report } = callbacks.current;

      if (report) {
        frames++;
        if (!statsFrom) statsFrom = now;
        if (now - statsFrom >= 1000) {
          report({ fps: Math.round((frames * 1000) / (now - statsFrom)), draws });
          frames = 0;
          draws = 0;
          statsFrom = now;
        }
      }

      if (e.reduced) {
        if (e.requested && e.requested.start < 0) {
          const name = e.requested.name;
          e.requested.start = now;
          draw(applyPatch(NEUTRAL, TIMELINES[name].still));
          clearTimeout(stillTimer);
          stillTimer = setTimeout(() => {
            finishRequested();
            draw(NEUTRAL);
          }, TIMELINES[name].duration);
        } else if (!e.requested) draw(NEUTRAL);
        return;
      }

      if (e.requested && e.requested.start < 0) e.requested.start = now;
      if (e.requested && now - e.requested.start >= TIMELINES[e.requested.name].duration) {
        finishRequested();
        e.nextAutoAt = now + between(2500, 4500);
      }
      if (e.auto && now - e.auto.start >= e.auto.timeline.duration) {
        e.auto = null;
        e.nextAutoAt = now + between(4000, 7000);
      }

      if (!e.requested && !e.auto && mode !== "none") {
        if (!e.nextAutoAt) e.nextAutoAt = now + between(2500, 4000);
        else if (now >= e.nextAutoAt) {
          const pool = AMBIENT_POOL[mode];
          e.auto = { timeline: pool[Math.floor(Math.random() * pool.length)], start: now };
        }
      }

      const active: { timeline: Timeline; start: number } | null = e.requested
        ? { timeline: TIMELINES[e.requested.name], start: e.requested.start }
        : e.auto;

      let pose = active ? sampleTimeline(active.timeline, now - active.start) : NEUTRAL;

      if (!active || active.timeline.breathing) {
        const breath = Math.floor((now % BREATH_PERIOD) / (BREATH_PERIOD / 2));
        pose = applyPatch(pose, { head: { dy: pose.head.dy + breath }, wing: { dy: pose.wing.dy + breath } });
      }

      if (!active || active.timeline.allowBlink) {
        if (!e.nextBlinkAt) e.nextBlinkAt = now + between(1500, 3000);
        if (now >= e.nextBlinkAt) {
          e.blinkStart = now;
          e.nextBlinkAt = now + between(3000, 6000);
        }
        const lid = sampleBlink(now - e.blinkStart);
        if (lid && lid !== "open" && pose.eyes !== "happy") pose = { ...pose, eyes: lid };
      }

      draw(pose);
    };

    loadMascotLayers()
      .then((layers) => {
        if (cancelled) return;
        e.renderer = new MascotRenderer(layers);
        e.lastKey = "";
        raf = requestAnimationFrame(tick);
        setReady(true);
      })
      .catch(() => {
        // The static sprite underneath stays visible.
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(stillTimer);
      motion.removeEventListener("change", onMotion);
      e.renderer = null;
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static first paint and no-JS fallback for the canvas */}
      <img
        src="/mascots/sefardlab/owl-classic-128.png"
        alt=""
        width={MASCOT_SIZE}
        height={MASCOT_SIZE}
        draggable={false}
        className="mascot-sprite"
        style={ready ? { visibility: "hidden" } : undefined}
      />
      <canvas ref={canvasRef} width={MASCOT_SIZE} height={MASCOT_SIZE} className="mascot-canvas" aria-hidden="true" />
    </>
  );
}
