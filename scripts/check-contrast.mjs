// Verifica los pares texto/fondo del design system contra WCAG AA.
// Uso: node scripts/check-contrast.mjs
const lum = (hex) => {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [nombre, texto, fondo, mínimo] — 4.5 texto normal, 3 texto grande / UI
const pairs = {
  light: [
    ["text / bg", "#16222C", "#FAF7F2", 4.5],
    ["text-muted / bg", "#4A5868", "#FAF7F2", 4.5],
    ["text-muted / surface-sunken", "#4A5868", "#F2EEE6", 4.5],
    ["on-primary / primary", "#FFFFFF", "#1B4965", 4.5],
    ["on-primary / primary-hover", "#FFFFFF", "#0E2A3D", 4.5],
    ["primary / primary-soft", "#1B4965", "#DCE8F1", 4.5],
    ["on-secondary / secondary", "#16222C", "#E8B441", 4.5],
    ["on-accent / accent-strong", "#FFFFFF", "#B4442A", 4.5],
    ["accent-strong / bg", "#B4442A", "#FAF7F2", 4.5],
    ["accent-strong / accent-soft", "#B4442A", "#FCEBE5", 4.5],
    ["success / success-soft", "#276C44", "#E6F4EB", 4.5],
    ["success / surface", "#276C44", "#FFFFFF", 4.5],
    ["on-band / band", "#FFFFFF", "#1B4965", 4.5],
    ["on-band-muted / band", "#C9D6E2", "#1B4965", 4.5],
    ["secondary / band (unidades grandes)", "#E8B441", "#1B4965", 3],
    ["border-strong / surface (UI, 1.4.11)", "#8A8272", "#FFFFFF", 3],
    ["border-strong / bg (UI, 1.4.11)", "#8A8272", "#FAF7F2", 3],
  ],
  dark: [
    ["text / bg", "#ECEFF3", "#0E1A24", 4.5],
    ["text-muted / surface", "#A3B1BF", "#16242F", 4.5],
    ["text-muted / surface-sunken", "#A3B1BF", "#0A141C", 4.5],
    ["on-primary / primary", "#0E1A24", "#7FB3D5", 4.5],
    ["primary / primary-soft", "#7FB3D5", "#18374C", 4.5],
    ["on-secondary / secondary", "#0E1A24", "#E8B441", 4.5],
    ["on-accent / accent", "#0E1A24", "#F08A6E", 4.5],
    ["accent / accent-soft", "#F08A6E", "#3D1E16", 4.5],
    ["success / success-soft", "#5CC28A", "#16352A", 4.5],
    ["on-band / band", "#FFFFFF", "#18374C", 4.5],
    ["on-band-muted / band", "#C9D6E2", "#18374C", 4.5],
    ["border-strong / surface (UI, 1.4.11)", "#5F7689", "#16242F", 3],
  ],
};

let failed = 0;
for (const [theme, list] of Object.entries(pairs)) {
  console.log(`\n${theme}`);
  for (const [name, fg, bg, min] of list) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${name}`);
  }
}
process.exit(failed ? 1 : 0);
