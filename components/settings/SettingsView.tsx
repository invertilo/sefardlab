"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePreferences } from "@/lib/contexts/PreferencesContext";
import { routes } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import type { ThemeMode, FontSize, Language } from "@/lib/contexts/PreferencesContext";

export function SettingsView() {
  const router = useRouter();
  const { logout } = useAuth();
  const { preferences, setTheme, setFontSize, setLanguage, setSound, setNotifications } = usePreferences();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await logout();
    } catch {
      // La sesión local ya se limpió en el contexto; seguimos al login igualmente.
    }
    router.replace(routes.login);
    router.refresh();
  }

  const languages: Array<{ value: Language; label: string }> = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "he", label: "עברית" },
  ];

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-8">
      {/* Tema */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Tema</h2>
            <p className="text-sm text-muted">Elige cómo deseas ver la interfaz</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="sr-only">Selecciona un tema</legend>

            {(["light", "dark", "system"] as const).map((mode: ThemeMode) => {
              const labels = {
                light: "Claro",
                dark: "Oscuro",
                system: "Sistema",
              };

              return (
                <label key={mode} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-surface-sunken">
                  <input
                    type="radio"
                    name="theme"
                    value={mode}
                    checked={preferences.theme === mode}
                    onChange={() => setTheme(mode)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="font-medium text-text">{labels[mode]}</span>
                </label>
              );
            })}
          </fieldset>
        </div>
      </Card>

      {/* Tamaño de Fuente */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Tamaño de Fuente</h2>
            <p className="text-sm text-muted">Ajusta el tamaño del texto a tu comodidad</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="sr-only">Selecciona un tamaño</legend>

            {(["small", "normal", "large"] as const).map((size: FontSize) => {
              const labels = {
                small: "Pequeño (14px)",
                normal: "Normal (16px)",
                large: "Grande (18px)",
              };

              const previewClasses = {
                small: "text-sm",
                normal: "text-base",
                large: "text-lg",
              };

              return (
                <label key={size} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-surface-sunken">
                  <input
                    type="radio"
                    name="fontSize"
                    value={size}
                    checked={preferences.fontSize === size}
                    onChange={() => setFontSize(size)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className={`font-medium text-text ${previewClasses[size]}`}>
                    {labels[size]}
                  </span>
                </label>
              );
            })}
          </fieldset>
        </div>
      </Card>

      {/* Idioma */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Idioma</h2>
            <p className="text-sm text-muted">Selecciona tu idioma preferido</p>
          </div>

          <Select
            label="Idioma de la interfaz"
            options={languages.map((lang) => ({
              value: lang.value,
              label: lang.label,
            }))}
            value={preferences.language}
            onChange={(e) => setLanguage(e.currentTarget.value as Language)}
            className="w-full"
          />
        </div>
      </Card>

      {/* Sonido */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Sonido</h2>
            <p className="text-sm text-muted">Activa o desactiva los efectos de sonido</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-surface-sunken">
            <input
              type="checkbox"
              checked={preferences.sound}
              onChange={(e) => setSound(e.currentTarget.checked)}
              className="h-5 w-5 accent-primary"
            />
            <span className="font-medium text-text">
              {preferences.sound ? "Sonido activado" : "Sonido desactivado"}
            </span>
          </label>
        </div>
      </Card>

      {/* Notificaciones */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Notificaciones</h2>
            <p className="text-sm text-muted">Recibe recordatorios para completar lecciones</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-surface-sunken">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setNotifications(e.currentTarget.checked)}
              className="h-5 w-5 accent-primary"
            />
            <span className="font-medium text-text">
              {preferences.notifications ? "Notificaciones activadas" : "Notificaciones desactivadas"}
            </span>
          </label>
        </div>
      </Card>

      {/* Logout */}
      <Card className="border-accent-soft bg-accent-soft/20">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Sesión</h2>
            <p className="text-sm text-muted">Cierra tu sesión en Sefardlab</p>
          </div>

          <Button
            variant="accent"
            size="md"
            fullWidth
            onClick={handleLogout}
            disabled={pending}
          >
            {pending ? "Saliendo…" : "Salir"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
