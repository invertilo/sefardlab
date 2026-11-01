import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/site";
import { Container } from "./Container";
import { Logo } from "./Logo";

const nav = [
  { href: "/#metodo", label: "Método" },
  { href: "/#demo", label: "Pruébalo" },
  { href: "/#comunidad", label: "Comunidad" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Principal" className="hidden gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium text-muted no-underline transition-colors duration-200 hover:bg-surface-sunken hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* En pantallas < 400px se oculta; el acceso sigue en el footer y en /signup */}
          <span className="hidden min-[400px]:contents">
            <Button href={routes.login} variant="ghost" className="px-3 sm:px-4">
              Entrar
            </Button>
          </span>
          <Button href={routes.signup} className="px-4">
            Comenzar
          </Button>
        </div>
      </Container>
    </header>
  );
}
