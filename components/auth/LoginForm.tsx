"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/hooks/useAuth";
import { routes } from "@/lib/site";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { FormAlert, safeRedirectTarget } from "./FormAlert";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await login(parsed.data);
      router.replace(safeRedirectTarget(routes.dashboard));
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        setFormError(err.message);
      } else {
        setFormError("No pudimos iniciar sesión. Inténtalo de nuevo.");
      }
    }
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit} aria-busy={submitting}>
      {formError && <FormAlert>{formError}</FormAlert>}
      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        required
        error={errors.email}
        disabled={submitting}
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
        disabled={submitting}
      />
      <Button type="submit" fullWidth size="lg" className="mt-2" disabled={submitting}>
        {submitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
