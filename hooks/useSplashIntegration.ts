"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSplash } from "./useSplash";
import { getRouteVariant } from "@/lib/splash/routeConfig";

export function useSplashIntegration() {
  const pathname = usePathname();
  const { show, hide } = useSplash();
  const currentPathnameRef = useRef(pathname);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentPathnameRef.current === pathname) {
      return;
    }

    currentPathnameRef.current = pathname;

    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);

    navigationTimeoutRef.current = setTimeout(() => {
      const config = getRouteVariant(pathname);
      show({
        variant: config.variant,
        message: config.message,
        showProgress: true,
      });

      showTimeoutRef.current = setTimeout(() => {
        hide();
      }, 3000);
    }, 250);

    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, [pathname, show, hide]);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);
}
