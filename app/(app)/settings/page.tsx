import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Ajustes",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text md:text-4xl">Ajustes</h1>
        <p className="mt-2 text-muted">Personaliza tu experiencia en Sefardlab</p>
      </div>
      <SettingsView />
    </div>
  );
}
