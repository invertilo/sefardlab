import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { LessonContentBlock } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { HebrewText } from "./HebrewText";

type HebrewBlock = Extract<LessonContentBlock, { type: "hebrew" }>;
type ImageBlock = Extract<LessonContentBlock, { type: "image" }>;

/** Bloques consecutivos de hebreo se agrupan en una cuadrícula de tarjetas. */
type Group =
  | { kind: "hebrew"; blocks: HebrewBlock[]; start: number }
  | { kind: "single"; block: Exclude<LessonContentBlock, HebrewBlock>; start: number };

function groupBlocks(blocks: LessonContentBlock[]): Group[] {
  const groups: Group[] = [];
  blocks.forEach((block, i) => {
    const last = groups.at(-1);
    if (block.type === "hebrew") {
      if (last?.kind === "hebrew") last.blocks.push(block);
      else groups.push({ kind: "hebrew", blocks: [block], start: i });
    } else {
      groups.push({ kind: "single", block, start: i });
    }
  });
  return groups;
}

/** Entrada escalonada, con tope para que las lecciones largas no tarden. */
function stagger(index: number): CSSProperties {
  return { animationDelay: `${Math.min(index, 8) * 60}ms` };
}

function TextBlock({ data }: { data: string }) {
  return <p className="text-lg leading-relaxed text-text">{data}</p>;
}

function TipBlock({ data }: { data: string }) {
  return (
    <aside className="flex gap-3 rounded-xl border-s-4 border-secondary bg-secondary-soft p-4 text-text">
      <Icon name="star" size={20} className="mt-0.5 text-text" />
      <p>
        <span className="font-semibold">Consejo: </span>
        {data}
      </p>
    </aside>
  );
}

function HebrewCard({ block, style }: { block: HebrewBlock; style?: CSSProperties }) {
  const hasDetails = Boolean(block.transliteration || block.translation);
  return (
    <li
      style={style}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface p-4 text-center shadow-1",
        "motion-safe:animate-slide-up",
        !hasDetails && "py-8",
      )}
    >
      <HebrewText>{block.data}</HebrewText>
      {block.transliteration && <span className="font-semibold text-primary">{block.transliteration}</span>}
      {block.translation && <span className="text-sm text-muted">{block.translation}</span>}
    </li>
  );
}

function HebrewGrid({ blocks, start }: { blocks: HebrewBlock[]; start: number }) {
  // Letras y palabras cortas caben de dos en dos (o tres) incluso en móvil.
  const allShort = blocks.every((b) => [...b.data].length <= 8);
  return (
    <ul
      role="list"
      className={cn(
        "m-0 grid list-none gap-3 p-0",
        blocks.length === 1
          ? "grid-cols-1"
          : allShort
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {blocks.map((block, i) => (
        <HebrewCard key={start + i} block={block} style={stagger(start + i)} />
      ))}
    </ul>
  );
}

function ImageFigure({ block }: { block: ImageBlock }) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      {/* Imágenes de contenido con URL arbitraria: sin optimizador de next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-2xl border border-border bg-surface-sunken object-contain"
      />
      {block.caption && <figcaption className="text-center text-sm text-muted">{block.caption}</figcaption>}
    </figure>
  );
}

type LessonContentProps = {
  blocks: LessonContentBlock[];
  className?: string;
};

/**
 * Contenido teórico de la lección: texto en español, tarjetas de hebreo
 * (con transliteración y traducción si existen), consejos e imágenes.
 */
export function LessonContent({ blocks, className }: LessonContentProps) {
  if (blocks.length === 0) return null;

  return (
    <section aria-label="Contenido de la lección" className={cn("flex flex-col gap-5", className)}>
      {groupBlocks(blocks).map((group) => {
        if (group.kind === "hebrew") {
          return <HebrewGrid key={group.start} blocks={group.blocks} start={group.start} />;
        }
        const { block, start } = group;
        let node: ReactNode;
        switch (block.type) {
          case "text":
            node = <TextBlock data={block.data} />;
            break;
          case "tip":
            node = <TipBlock data={block.data} />;
            break;
          case "image":
            node = <ImageFigure block={block} />;
            break;
          default:
            // Tipo desconocido llegado de la BD: se ignora en lugar de romper la página.
            return null;
        }
        return (
          <div key={start} style={stagger(start)} className="motion-safe:animate-slide-up">
            {node}
          </div>
        );
      })}
    </section>
  );
}
