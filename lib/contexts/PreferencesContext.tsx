"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "small" | "normal" | "large";
export type Language = "es" | "en" | "he";

export type Preferences = {
  theme: ThemeMode;
  fontSize: FontSize;
  language: Language;
  sound: boolean;
  notifications: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  fontSize: "normal",
  language: "es",
  sound: true,
  notifications: true,
};

const STORAGE_KEY = "sefardlab-preferences";

type PreferencesContextType = {
  preferences: Preferences;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setLanguage: (lang: Language) => void;
  setSound: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

function readPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writePreferences(prefs: Preferences): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Modo privado o almacenamiento bloqueado
  }
}

function applyTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;

  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function applyFontSize(size: FontSize): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("text-sm", "text-base", "text-lg");

  switch (size) {
    case "small":
      root.classList.add("text-sm");
      root.style.fontSize = "14px";
      break;
    case "large":
      root.classList.add("text-lg");
      root.style.fontSize = "18px";
      break;
    case "normal":
    default:
      root.classList.add("text-base");
      root.style.fontSize = "16px";
      break;
  }
}

function initializePreferences(): Preferences {
  const loaded = readPreferences();
  if (typeof window !== "undefined") {
    applyTheme(loaded.theme);
    applyFontSize(loaded.fontSize);
  }
  return loaded;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<Preferences>(initializePreferences);

  const updatePreferences = useCallback((updates: Partial<Preferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...updates };
      writePreferences(updated);
      return updated;
    });
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      updatePreferences({ theme });
      applyTheme(theme);
    },
    [updatePreferences],
  );

  const setFontSize = useCallback(
    (size: FontSize) => {
      updatePreferences({ fontSize: size });
      applyFontSize(size);
    },
    [updatePreferences],
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      updatePreferences({ language: lang });
      // Nota: el cambio de idioma real se manejaría a nivel de i18n en producción
    },
    [updatePreferences],
  );

  const setSound = useCallback(
    (enabled: boolean) => {
      updatePreferences({ sound: enabled });
    },
    [updatePreferences],
  );

  const setNotifications = useCallback(
    (enabled: boolean) => {
      updatePreferences({ notifications: enabled });
    },
    [updatePreferences],
  );

  const value = useMemo<PreferencesContextType>(
    () => ({
      preferences,
      setTheme,
      setFontSize,
      setLanguage,
      setSound,
      setNotifications,
    }),
    [preferences, setTheme, setFontSize, setLanguage, setSound, setNotifications],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextType {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences debe usarse dentro de <PreferencesProvider>");
  return ctx;
}
