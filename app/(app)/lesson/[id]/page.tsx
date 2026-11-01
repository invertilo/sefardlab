import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer, LessonSkeleton } from "@/components/lesson/LessonPlayer";
import { parseLessonDay, TOTAL_DAYS } from "@/lib/lesson";
import { LessonSwipe } from "./LessonSwipe";

type Props = PageProps<"/lesson/[id]">;

/** Las 30 lecciones del reto se prerenderizan en build (el contenido llega de la API). */
export function generateStaticParams() {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => ({ id: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Lección ${id}` };
}

/**
 * /lesson/[id]: el proxy redirige a /login sin sesión; `LessonPlayer` vuelve a
 * comprobarla en el cliente, carga la lección de `/api/lessons/[day]` y guarda
 * el resultado con `useProgress().saveResult()`.
 *
 * `params` se lee dentro de <Suspense> para que la navegación sea instantánea
 * (Cache Components): el esqueleto se muestra mientras se resuelve.
 */
export default function LessonPage({ params }: Props) {
  return (
    <Suspense fallback={<LessonSkeleton label="Cargando la lección…" />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<Props, "params">) {
  const { id } = await params;
  const day = parseLessonDay(id);
  if (day === null) notFound();

  // `key`: cada día es una lección nueva, sin arrastrar estado de la anterior.
  // `LessonSwipe`: deslizar a la izquierda avanza de paso (igual que el botón visible).
  return (
    <LessonSwipe>
      <LessonPlayer key={day} day={day} />
    </LessonSwipe>
  );
}
