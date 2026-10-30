"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { routes } from "@/lib/site";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await logout();
    } catch {
      // La sesión local ya se limpió en el contexto; seguimos al login igualmente.
    }
    router.replace(routes.login);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-muted hover:bg-surface-sunken hover:text-text disabled:opacity-60"
    >
      {pending ? "Saliendo…" : "Salir"}
    </button>
  );
}
