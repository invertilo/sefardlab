export const site = {
  name: "Sefardlab",
  tagline: "Del español al hebreo, 30 días para leer",
  description:
    "Aprende a leer hebreo en 30 días desde el español: alfabeto, palabras, frases y lectura fluida en sesiones de 10 minutos.",
} as const;

export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  achievements: "/achievements",
  settings: "/settings",
  lesson: (id: string | number) => `/lesson/${id}`,
} as const;

/** Las 4 fases del reto de 30 días. */
export const phases = [
  { key: "alfabeto", title: "Alfabeto", days: "Días 1–7", from: 1, to: 7 },
  { key: "palabras", title: "Palabras", days: "Días 8–15", from: 8, to: 15 },
  { key: "frases", title: "Frases", days: "Días 16–23", from: 16, to: 23 },
  { key: "lectura", title: "Lectura fluida", days: "Días 24–30", from: 24, to: 30 },
] as const;
