import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MascotPreview } from "./MascotPreview";

export const metadata: Metadata = {
  title: "Mascot preview",
  robots: { index: false, follow: false },
};

export default function MascotPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MascotPreview />;
}
