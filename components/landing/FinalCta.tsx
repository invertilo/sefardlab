import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/layout/Container";
import { routes } from "@/lib/site";
import { TilePattern } from "./TilePattern";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="pt-20 text-center">
      <Container>
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border/70 bg-surface px-6 py-16 shadow-2 md:py-20">
          <TilePattern id="tile-cta" className="text-secondary opacity-[0.12] [mask-image:radial-gradient(circle_at_center,transparent_35%,#000_90%)]" />
          <span lang="he" dir="rtl" className="relative font-hebrew text-2xl font-bold text-accent-strong">
            בּוֹאוּ נַתְחִיל
          </span>
          <h2 id="cta-title" className="relative max-w-[22ch] text-3xl font-bold md:text-[2.75rem]">
            En 30 días leerás esta línea sin pensarlo.
          </h2>
          <p className="relative max-w-xl text-muted">
            Arriba pone «empecemos». El primer día aprendes cinco letras; tarda menos que un café.
          </p>
          <Button href={routes.signup} size="lg" className="relative w-full max-w-xs">
            Comenzar mi reto
            <Icon name="arrow" size={20} />
          </Button>
        </div>
      </Container>
    </section>
  );
}
