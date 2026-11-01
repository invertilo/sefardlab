import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/site";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
        <Container className="flex min-h-16 items-center justify-between gap-4">
          <Logo href={routes.dashboard} />
          <nav aria-label="App" className="flex items-center gap-1">
            <Link
              href={routes.dashboard}
              className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-muted hover:bg-surface-sunken hover:text-text"
            >
              Panel
            </Link>
            <Link
              href={routes.achievements}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 font-medium text-muted hover:bg-surface-sunken hover:text-text"
            >
              <Icon name="trophy" size={20} />
              <span className="sr-only sm:not-sr-only">Insignias</span>
            </Link>
            <button
              type="button"
              aria-label="Ajustes (próximamente)"
              className="grid size-11 place-items-center rounded-lg text-muted hover:bg-surface-sunken hover:text-text"
            >
              <Icon name="settings" />
            </button>
            <LogoutButton />
          </nav>
        </Container>
      </header>
      <main className="flex-1 py-8 md:py-12">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
