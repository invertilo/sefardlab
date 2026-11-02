import { LandingSplash } from "@/components/splash/LandingSplash";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Features } from "@/components/landing/Features";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";

export default function HomePage() {
  return (
    <>
      <LandingSplash />
      <a
        href="#main"
        className="absolute -top-24 left-4 z-[100] rounded-lg bg-surface px-4 py-2 focus:top-4"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Features />
        <Stats />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
