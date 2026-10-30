import { Container } from "@/components/layout/Container";
import { SectionHead } from "./Eyebrow";

// TODO: cifras de ejemplo. Sustituir por datos reales (DB) antes de publicar.
const stats = [
  { value: "50", unit: "k+", label: "estudiantes en el reto" },
  { value: "2.1", unit: "M", label: "palabras leídas" },
  { value: "30", unit: " días", label: "de principio a fin" },
  { value: "10", unit: " min", label: "al día, nada más" },
];

export function Stats() {
  return (
    <section
      id="comunidad"
      aria-labelledby="comunidad-title"
      className="scroll-mt-16 bg-band py-20 text-on-band [&_h2]:text-on-band"
    >
      <Container>
        <SectionHead
          eyebrow="Comunidad"
          id="comunidad-title"
          title="Miles de personas ya leen hebreo."
          className="[&>p]:text-on-band-muted [&>span]:text-secondary"
        >
          Estudiantes de toda Latinoamérica y España completan el reto cada mes.
        </SectionHead>

        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 border-t border-white/20 pt-4">
              <dt className="order-2 text-sm text-on-band-muted">{s.label}</dt>
              <dd className="order-1 m-0 font-display text-4xl font-bold leading-tight text-on-band md:text-5xl">
                {s.value}
                <span className="text-secondary">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>

        <figure className="mt-16 grid gap-6 rounded-xl border border-white/15 bg-white/5 p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
          <blockquote className="m-0 font-display text-xl font-medium leading-snug md:text-2xl">
            “Siempre quise leer los textos de mi familia. Al día 30 leí mi primer párrafo entero sin
            transliteración.”
          </blockquote>
          <figcaption className="flex items-center gap-4 text-sm text-on-band-muted">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary font-bold text-[#16222C]"
            >
              LM
            </span>
            <span>
              <strong className="block text-base font-medium text-on-band">Lucía M.</strong>
              Buenos Aires · Reto completado
            </span>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
