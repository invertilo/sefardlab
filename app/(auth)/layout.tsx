import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { TilePattern } from "@/components/landing/TilePattern";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center px-4 py-8">
      <TilePattern id="tile-auth" className="text-primary opacity-[0.05]" />
      <header className="relative mb-8 flex w-full max-w-md items-center justify-between">
        <Logo />
        <Link href="/" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          Volver al inicio
        </Link>
      </header>
      <main className="relative w-full max-w-md">{children}</main>
    </div>
  );
}
