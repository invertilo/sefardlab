import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/layout/Container";
import { Mascot } from "@/components/splash/mascot/Mascot";
import { routes } from "@/lib/site";
import { Eyebrow } from "./Eyebrow";
import { TilePattern } from "./TilePattern";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pb-20 pt-12 lg:pb-24 lg:pt-20">
      <TilePattern id="tile-hero" className="text-primary opacity-[0.06] [mask-image:linear-gradient(180deg,#000_30%,transparent_95%)]" />
      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="flex max-w-xl flex-col gap-6">
          <Eyebrow>Reto de lectura en hebreo</Eyebrow>
          <h1 id="hero-title" className="text-[clamp(2.25rem,1.5rem+3.6vw,4.25rem)] font-bold leading-[1.04]">
            Del español al hebreo,{" "}
            <em className="relative isolate whitespace-nowrap not-italic text-accent-strong after:absolute after:inset-x-0 after:bottom-[0.04em] after:-z-10 after:h-[0.14em] after:rounded after:bg-secondary">
              30 días
            </em>{" "}
            para leer.
          </h1>
          <p className="max-w-lg text-lg text-muted md:text-xl">
            Diez minutos al día. Empiezas reconociendo letras y terminas leyendo textos cortos,
            con cada paso explicado desde el español que ya hablas.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={routes.signup} size="lg" className="w-full sm:w-auto">
              Comenzar mi reto
              <Icon name="arrow" size={20} />
            </Button>
            <Button href="#demo" variant="outline" size="lg" className="w-full sm:w-auto">
              Ver más
            </Button>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="check" size={18} className="text-primary" />
            Gratis para empezar. Sin tarjeta.
          </p>
        </div>

        <div id="demo" className="scroll-mt-24 flex justify-center lg:justify-end">
          <Mascot variant="classic" state="idle" className="mascot-lg" />
        </div>
      </Container>
    </section>
  );
}
