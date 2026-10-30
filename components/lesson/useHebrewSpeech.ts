"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Pronunciación con la Web Speech API del navegador (sin archivos de audio).
 * `available` es false en el servidor, si el navegador no la soporta o si no
 * tiene ninguna voz en hebreo instalada.
 */

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  // Las voces se cargan de forma asíncrona en Chrome.
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

/** Nombre de la voz hebrea (string estable para useSyncExternalStore). */
function getHebrewVoiceName(): string {
  if (!("speechSynthesis" in window)) return "";
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("he"));
  return voice?.name ?? "";
}

export type SpeechRate = "normal" | "slow";

export function useHebrewSpeech() {
  const voiceName = useSyncExternalStore(subscribe, getHebrewVoiceName, () => "");
  const [speaking, setSpeaking] = useState<SpeechRate | null>(null);

  // Corta el audio al salir de la pantalla (o al ocultarse con <Activity>).
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = useCallback(
    (text: string, rate: SpeechRate = "normal") => {
      const synth = window.speechSynthesis;
      const voice = synth.getVoices().find((v) => v.name === voiceName);
      if (!voice) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = rate === "slow" ? 0.6 : 0.95;
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      setSpeaking(rate);
      synth.speak(utterance);
    },
    [voiceName],
  );

  return { available: voiceName !== "", speaking, speak };
}
