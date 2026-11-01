import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Container } from "@/components/layout/Container";
import { phases } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SectionHead } from "./Eyebrow";

const iconTone = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-text",
  accent: "bg-accent-soft text-accent-strong",
} as const;

function FeatureIcon({ name, tone }: { name: IconName; tone: keyof typeof iconTone }) {
  return (
    <span className={cn("grid size-12 place-items-center rounded-2xl shadow-1", iconTone[tone])}>
      <Icon name={name} />
    </span>
  );
}

function Hebrew({ children, className }: { children: string; className?: string }) {
  return (
    <span lang="he" dir="rtl" className={cn("font-hebrew font-bold", className)}>
      {children}
    </span>
  );
}

/** Barra de 30 días dividida en las 4 fases. */
function Timeline() {
  return (
    <div className="mb-8 grid grid-cols-[7fr_8fr_8fr_7fr] gap-1.5" aria-hidden="true">
      {phases.map((p, i) => (
        <div key={p.key} className="flex flex-col gap-2">
          <span
            className={cn(
              "h-2 rounded-full",
              ["bg-primary", "bg-secondary", "bg-accent", "bg-success"][i],
            )}
          />
          <span className="hidden text-xs font-medium text-muted sm:block">{p.days}</span>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  const [alefato, palabras, frases, lectura] = phases;

  return (
    <section id="metodo" aria-labelledby="metodo-title" className="scroll-mt-16 py-20">
      <Container>
        <SectionHead eyebrow="El método" id="metodo-title" title="Cuatro fases, un objetivo: leer.">
          Cada semana construye sobre la anterior. Nada de memorizar listas: lees desde el primer día.
        </SectionHead>

        <Timeline />

        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
          <Card as="article" interactive padding="lg" className="flex flex-col gap-4 lg:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <FeatureIcon name="book" tone="primary" />
              <Badge variant="primary">{alefato.days}</Badge>
            </div>
            <CardTitle>{alefato.title}</CardTitle>
            <CardDescription>
              Las 22 letras y sus vocales (nikud), agrupadas por sonidos que ya conoces del español.
              Al final de la semana reconoces cualquier letra.
            </CardDescription>
            <div lang="he" dir="rtl" className="mt-auto flex gap-2 pt-2 font-hebrew" aria-hidden="true">
              {["א", "ב", "ג", "ד", "ה", "ו", "ז"].map((l, i) => (
                <span
                  key={l}
                  className={cn(
                    "grid aspect-square max-w-11 flex-1 place-items-center rounded-lg text-[1.375rem] font-bold",
                    i === 0 ? "bg-primary text-on-primary" : "bg-surface-sunken text-text",
                    i > 4 && "hidden sm:grid",
                  )}
                >
                  {l}
                </span>
              ))}
            </div>
          </Card>

          <Card as="article" interactive padding="lg" className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <FeatureIcon name="star" tone="secondary" />
              <Badge variant="secondary">{palabras.days}</Badge>
            </div>
            <CardTitle>{palabras.title}</CardTitle>
            <CardDescription>
              Tus primeras 300 palabras, empezando por las que el hebreo y el español comparten.
            </CardDescription>
            <div className="mt-auto flex flex-wrap gap-2 pt-2" aria-hidden="true">
              <Badge>
                <Hebrew>שָׁלוֹם</Hebrew>
              </Badge>
              <Badge>
                <Hebrew>תּוֹדָה</Hebrew>
              </Badge>
              <Badge>
                <Hebrew>סֵפֶר</Hebrew>
              </Badge>
            </div>
          </Card>

          <Card as="article" interactive padding="lg" className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <FeatureIcon name="fire" tone="accent" />
              <Badge variant="accent">{frases.days}</Badge>
            </div>
            <CardTitle>{frases.title}</CardTitle>
            <CardDescription>
              Une palabras en frases reales: saludos, preguntas y expresiones del día a día.
            </CardDescription>
            <div className="mt-auto flex items-baseline justify-between gap-3 rounded-xl bg-surface-sunken px-4 py-3" aria-hidden="true">
              <span className="text-sm text-muted">buenos días</span>
              <Hebrew className="text-2xl text-text">בֹּקֶר טוֹב</Hebrew>
            </div>
          </Card>

          <Card as="article" interactive padding="lg" className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <FeatureIcon name="trophy" tone="primary" />
              <Badge variant="success">{lectura.days}</Badge>
            </div>
            <CardTitle>{lectura.title}</CardTitle>
            <CardDescription>
              Textos cortos con y sin vocales. El último día lees un párrafo completo sin ayuda.
            </CardDescription>
            <div className="mt-auto grid grid-cols-2 gap-2" aria-hidden="true">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-sunken px-3 py-3">
                <Hebrew className="text-xl text-text">מַה שְּׁלוֹמְךָ</Hebrew>
                <span className="text-xs text-muted">con nikud</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border-[1.5px] border-success bg-success-soft px-3 py-3">
                <Hebrew className="text-xl text-text">מה שלומך</Hebrew>
                <span className="text-xs font-medium text-success">sin nikud</span>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
