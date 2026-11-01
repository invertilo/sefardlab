"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SplashScreen } from "./SplashScreen";
import type { MascotVariant } from "./mascot/MascotTypes";

interface SplashContextType {
  isVisible: boolean;
  show: (options: {
    variant?: MascotVariant;
    message?: string;
    showProgress?: boolean;
    duration?: number;
  }) => void;
  hide: () => void;
}

export const SplashContext = createContext<SplashContextType | null>(null);

interface SplashProviderProps {
  children: ReactNode;
}

export function SplashProvider({ children }: SplashProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [variant, setVariant] = useState<MascotVariant>("classic");
  const [message, setMessage] = useState<string | undefined>();
  const [showProgress, setShowProgress] = useState(false);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    setIsVisible(false);
    if (hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
  }, [hideTimer]);

  const show = useCallback(
    (options: {
      variant?: MascotVariant;
      message?: string;
      showProgress?: boolean;
      duration?: number;
    }) => {
      // Limpiar temporizadores previos
      if (hideTimer) {
        clearTimeout(hideTimer);
      }

      setVariant(options.variant || "classic");
      setMessage(options.message);
      setShowProgress(options.showProgress ?? false);
      setIsVisible(true);

      // Si hay una duración, esconder automáticamente
      if (options.duration && options.duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, options.duration);
        setHideTimer(timer);
      }
    },
    [hideTimer],
  );

  const value = useMemo<SplashContextType>(
    () => ({
      isVisible,
      show,
      hide,
    }),
    [isVisible, show, hide],
  );

  return (
    <SplashContext.Provider value={value}>
      {children}
      <SplashScreen
        isVisible={isVisible}
        variant={variant}
        message={message}
        showProgress={showProgress}
      />
    </SplashContext.Provider>
  );
}
