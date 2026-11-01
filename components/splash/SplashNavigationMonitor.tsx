"use client";

import { useSplashIntegration } from "@/hooks/useSplashIntegration";
import { useUser } from "@/lib/hooks/useUser";

export function SplashNavigationMonitor() {
  const { isLoading } = useUser();
  useSplashIntegration(isLoading);
  return null;
}
