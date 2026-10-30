"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/hooks/useAuth";
import { routes } from "@/lib/site";
import { fieldErrors, signupSchema } from "@/lib/validation";
import { FormAlert } from "./FormAlert";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const level = form.get("level");
    const parsed = signupSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      goal: form.get("goal") ?? undefined,
      level: level ? level : undefined,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const result = await signup(parsed.data);
      if (result.needsEmailConfirmation) {
        setConfirmEmail(parsed.data.email);
        setSubmitting(false);
        return;
      }
      router.replace(routes.dashboard);
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        setFormError(err.message);
      } else {
        setFormError("No pudimos crear tu cuenta. Inténtalo de nuevo.");
      }
    }
  }

  if (confirmEmail) {
    return (
      <FormAlert tone="success">
        ¡Cuenta creada! Te enviamos un correo a <strong>{confirmEmail}</strong>. Confírmalo y después inicia
        sesión para empezar tu reto.
      </FormAlert>
    );
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit} aria-busy={submitting}>
      {formError && <FormAlert>{formError}</FormAlert>}
      <Input
        label="Nombre"
        name="name"
        autoComplete="given-name"
        placeholder="¿Cómo te llamamos?"
        required
        maxLength={80}
        error={errors.name}
        disabled={submitting}
      />
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
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        required
        minLength={8}
        maxLength={72}
        error={errors.password}
        disabled={submitting}
      />
      <Select
        label="Meta diaria"
        name="goal"
        defaultValue="10"
        error={errors.goal}
        disabled={submitting}
        options={[
          { value: "5", label: "5 minutos · tranquilo" },
          { value: "10", label: "10 minutos · recomendado" },
          { value: "15", label: "15 minutos · intenso" },
          { value: "20", label: "20 minutos · a fondo" },
        ]}
      />
      <Select
        label="¿Conoces el alefato?"
        name="level"
        placeholder="Elige una opción"
        error={errors.level}
        disabled={submitting}
        options={[
          { value: "none", label: "No, empiezo de cero" },
          { value: "some", label: "Reconozco algunas letras" },
          { value: "most", label: "Leo despacio, con vocales" },
        ]}
      />
      <Button type="submit" fullWidth size="lg" className="mt-2" disabled={submitting}>
        {submitting ? "Creando tu cuenta…" : "Comenzar mi reto"}
        {!submitting && <Icon name="arrow" size={20} />}
      </Button>
    </form>
  );
}
