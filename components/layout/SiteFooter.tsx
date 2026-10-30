import Link from "next/link";
import { routes } from "@/lib/site";
import { Container } from "./Container";
import { Logo } from "./Logo";

const links = [
  { href: routes.signup, label: "Crear cuenta" },
  { href: routes.login, label: "Iniciar sesión" },
  { href: routes.dashboard, label: "Mi panel" },
  { href: routes.lesson(1), label: "Lección 1" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border py-12">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Logo />
        <ul className="m-0 flex list-none flex-wrap gap-x-2 p-0">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm text-muted no-underline hover:text-text hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <small className="text-sm text-muted">© 2026 Sefardlab</small>
      </Container>
    </footer>
  );
}
