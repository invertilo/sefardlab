"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
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
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    setIsVisible(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (options: {
      variant?: MascotVariant;
      message?: string;
      showProgress?: boolean;
      duration?: number;
    }) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      setVariant(options.variant || "classic");
      setMessage(options.message);
      setShowProgress(options.showProgress ?? false);
      setIsVisible(true);

      if (options.duration && options.duration > 0) {
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, options.duration);
      }
    },
    [],
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
