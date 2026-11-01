import { Container } from "@/components/layout/Container";
import { SectionHead } from "./Eyebrow";

const program = [
  { value: "30", unit: " días", label: "de principio a fin" },
  { value: "10", unit: " min", label: "al día, nada más" },
  { value: "22", unit: " letras", label: "del alfabeto, una a una" },
  { value: "0", unit: " €", label: "para empezar" },
];

export function Stats() {
  return (
    <section
      id="programa"
      aria-labelledby="programa-title"
      className="scroll-mt-16 bg-band py-20 text-on-band [&_h2]:text-on-band"
    >
      <Container>
        <SectionHead
          eyebrow="Programa"
          id="programa-title"
          title="Un método con fecha de fin."
          className="[&>p]:text-on-band-muted [&>span]:text-secondary"
        >
          Un reto de 30 días con lecciones cortas.
        </SectionHead>

        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {program.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 border-t border-white/20 pt-4">
              <dt className="order-2 text-sm text-on-band-muted">{s.label}</dt>
              <dd className="order-1 m-0 font-display text-4xl font-bold leading-tight text-on-band md:text-5xl">
                {s.value}
                <span className="text-secondary">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>

      </Container>
    </section>
  );
}
