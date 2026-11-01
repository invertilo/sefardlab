"use client";

import { useContext } from "react";
import { SplashContext } from "@/components/splash/SplashProvider";

export function useSplash() {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error("useSplash debe usarse dentro de <SplashProvider>");
  }
  return context;
}
