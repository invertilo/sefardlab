import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/site";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Hola de nuevo</h1>
        <p className="text-muted">Continúa tu reto donde lo dejaste.</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link href={routes.signup} className="font-medium text-primary underline-offset-4 hover:underline">
          Comienza tu reto
        </Link>
      </p>
    </Card>
  );
}
