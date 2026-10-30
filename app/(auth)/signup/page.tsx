import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/site";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="self-start">
          <Icon name="fire" size={16} />
          Reto de 30 días
        </Badge>
        <h1 className="text-3xl font-bold">Empieza a leer hebreo</h1>
        <p className="text-muted">Crea tu cuenta y elige tu ritmo. Puedes cambiarlo cuando quieras.</p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={routes.login} className="font-medium text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
