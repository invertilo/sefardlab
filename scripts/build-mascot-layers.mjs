// Derives animation layers and frames from the official 128×128 mascot sprite.
// Run: node scripts/build-mascot-layers.mjs [--debug]
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const SRC = "public/mascots/sefardlab/owl-classic-128.png";
const OUT = "public/mascots/sefardlab/layers";
const DEBUG = process.argv.includes("--debug");
const N = 128;

const { data: master } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const idx = (x, y) => y * N + x;
const inside = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
const rgba = (buf, x, y) => { const i = idx(x, y) * 4; return [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]]; };
const opaque = (x, y) => master[idx(x, y) * 4 + 3] > 0;
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
const isDark = (x, y) => opaque(x, y) && lum(rgba(master, x, y)) < 60;
const isGold = (x, y) => { const [r, g, b, a] = rgba(master, x, y); return a > 0 && r > 230 && g > 150 && b < 130; };
const isCream = (x, y) => opaque(x, y) && lum(rgba(master, x, y)) >= 225;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];

// Palette sampled from the sprite itself.
const C = {
  outline: hex("#1a131b"),
  ink: hex("#25181d"),
  cream: hex("#fef1e3"),
  creamShade: hex("#f4dac3"),
  pageShade: hex("#eec9a9"),
  lidBrown: hex("#a15f45"),
  gold: hex("#fdbc44"),
  goldLight: hex("#fdc86e"),
  goldDeep: hex("#f4a833"),
};

const blank = () => Buffer.alloc(N * N * 4);
const put = (buf, x, y, c) => { if (!inside(x, y)) return; const i = idx(x, y) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3]; };
const copyPx = (dst, src, x, y) => put(dst, x, y, rgba(src, x, y));

function inPoly(poly, x, y) {
  const px = x + 0.5, py = y + 0.5;
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function flood(test, seeds) {
  const out = new Set(), stack = [];
  for (const [x, y] of seeds) if (test(x, y)) { out.add(idx(x, y)); stack.push([x, y]); }
  while (stack.length) {
    const [x, y] = stack.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!inside(nx, ny) || out.has(idx(nx, ny)) || !test(nx, ny)) continue;
      out.add(idx(nx, ny)); stack.push([nx, ny]);
    }
  }
  return out;
}

const maskFrom = (pred) => { const s = new Set(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (opaque(x, y) && pred(x, y)) s.add(idx(x, y)); return s; };
const xy = (k) => [k % N, Math.floor(k / N)];

// ---------- Region selections (hand-placed polygons refined by pixel class) ----------

const POINTER_POLY = [[97, 43], [106, 45], [100, 64], [91, 65], [90, 62]];
const WING_POLY = [[87, 63], [99, 62], [103, 68], [103, 84], [98, 91], [85, 91], [85, 70]];
// The wing's lower edge tucks over the robe; only its brown feathers belong to it there.
const WING_TUCK_POLY = [[85, 76], [85, 92], [80, 92], [80, 80]];
const isFeather = (x, y) => { const [r, g, b] = rgba(master, x, y); return !isGold(x, y) && !isCream(x, y) && r > b + 20 && lum([r, g, b]) >= 60; };
const MARKS_POLY = [[100, 33], [116, 33], [116, 54], [104, 54], [104, 45], [100, 45]];
const BOOK_POLY = [[12, 67], [22, 65], [31, 66], [37, 67.5], [55, 67.5], [57, 100], [12, 100]];
const HEAD_BOTTOM = 69;

// Connected from the grip so the neighbouring "!" emphasis marks are not swept in.
const pointer = flood((x, y) => opaque(x, y) && inPoly(POINTER_POLY, x, y) && !isCream(x, y), [[94, 62], [95, 60]]);
const wing = maskFrom((x, y) => inPoly(WING_POLY, x, y) || pointer.has(idx(x, y)) || (inPoly(WING_TUCK_POLY, x, y) && isFeather(x, y)));
const marks = maskFrom((x, y) => inPoly(MARKS_POLY, x, y) && !pointer.has(idx(x, y)));
const book = maskFrom((x, y) => inPoly(BOOK_POLY, x, y));
const head = maskFrom((x, y) => y <= HEAD_BOTTOM && !wing.has(idx(x, y)) && !marks.has(idx(x, y)) && !book.has(idx(x, y)));

// ---------- Eye sockets ----------

function eyeSocket({ seed, box, amberBox }) {
  const [bx0, by0, bx1, by1] = box;
  const inBox = (x, y) => x >= bx0 && x <= bx1 && y >= by0 && y <= by1;
  const iris = flood((x, y) => inBox(x, y) && isDark(x, y), [seed]);
  for (let y = amberBox[1]; y <= amberBox[3]; y++) for (let x = amberBox[0]; x <= amberBox[2]; x++) if (isGold(x, y)) iris.add(idx(x, y));
  // Fill holes row-wise (catch-lights live inside the iris).
  const socket = new Set(iris);
  for (let y = by0; y <= by1; y++) {
    const xs = [...iris].map(xy).filter(([, yy]) => yy === y).map(([x]) => x);
    if (!xs.length) continue;
    for (let x = Math.min(...xs); x <= Math.max(...xs); x++) socket.add(idx(x, y));
  }
  // Upper lid edge (brown row above the dark lash line).
  const top = Math.min(...[...iris].map((k) => xy(k)[1]));
  const lidXs = [...iris].map(xy).filter(([, y]) => y === top).map(([x]) => x);
  for (let x = Math.min(...lidXs); x <= Math.max(...lidXs); x++) if (!isCream(x, top - 1)) socket.add(idx(x, top - 1));
  // Absorb the soft brown rim around the iris, never the cream face or the gold glasses.
  const rim = (nx, ny) => inBox(nx, ny) && opaque(nx, ny) && !isCream(nx, ny) && !(isGold(nx, ny) && !iris.has(idx(nx, ny)));
  for (let pass = 0; pass < 2; pass++) {
    for (const k of [...socket]) {
      const [x, y] = xy(k);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1]]) {
        const nx = x + dx, ny = y + dy;
        // second pass only takes light rim pixels, so the dark lash flick at the outer corner survives
        if (rim(nx, ny) && (pass === 0 || lum(rgba(master, nx, ny)) > 110)) socket.add(idx(nx, ny));
      }
    }
  }
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    if (socket.has(idx(x, y)) || !rim(x, y)) continue;
    const around = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].filter(([dx, dy]) => socket.has(idx(x + dx, y + dy))).length;
    if (around >= 4) socket.add(idx(x, y));
  }
  const highlights = new Set([...socket].filter((k) => { const [x, y] = xy(k); return !iris.has(k) && isCream(x, y); }));
  const rows = new Map();
  for (const k of socket) { const [x, y] = xy(k); const r = rows.get(y) ?? [N, -1]; rows.set(y, [Math.min(r[0], x), Math.max(r[1], x)]); }
  const xs = [...socket].map((k) => xy(k)[0]), ys = [...socket].map((k) => xy(k)[1]);
  return { iris, socket, highlights, rows, lidTop: top, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const eyes = [
  eyeSocket({ seed: [44, 50], box: [37, 41, 54, 58], amberBox: [40, 53, 50, 59] }),
  eyeSocket({ seed: [74, 50], box: [66, 41, 83, 58], amberBox: [70, 53, 80, 59] }),
];

// ---------- Eye state patches ----------

function lidPatch(buf, eye, lidY) {
  for (const k of eye.socket) {
    const [x, y] = xy(k);
    if (y < lidY - 1) put(buf, x, y, C.cream);
    else if (y === lidY - 1) put(buf, x, y, C.creamShade);
    else if (y === lidY) put(buf, x, y, C.ink);
    else copyPx(buf, master, x, y);
  }
}

function closedPatch(buf, eye, shape) {
  const cx = (eye.x0 + eye.x1) / 2, w = (eye.x1 - eye.x0) / 2 - 1;
  for (const k of eye.socket) { const [x, y] = xy(k); put(buf, x, y, C.cream); }
  let prev = null;
  for (let x = eye.x0 + 1; x <= eye.x1 - 1; x++) {
    const t = (x - cx) / w;
    const y = shape === "happy" ? Math.round(51 - 3 * (1 - t * t)) : Math.round(50 + 2 * (1 - t * t));
    put(buf, x, y, C.ink);
    if (shape === "happy") put(buf, x, y + 1, C.ink);
    else { put(buf, x, y - 1, Math.abs(t) < 0.75 ? C.ink : C.creamShade); if (Math.abs(t) < 0.75) put(buf, x, y - 2, C.creamShade); }
    if (prev !== null) for (let yy = Math.min(prev, y) + 1; yy < Math.max(prev, y); yy++) put(buf, x, yy, C.ink);
    prev = y;
  }
}

function lookPatch(buf, eye, dx, dy, lidDrop = 0) {
  for (const k of eye.socket) {
    const [x, y] = xy(k);
    if (y <= eye.lidTop + lidDrop) { // keep the upper lid line in place (lowered for downward gaze)
      if (y < eye.lidTop - 1 + lidDrop) put(buf, x, y, C.cream);
      else if (y === eye.lidTop - 1 + lidDrop) put(buf, x, y, lidDrop ? C.creamShade : rgba(master, x, y));
      else put(buf, x, y, C.ink);
      continue;
    }
    const sx = x - dx, sy = y - dy;
    if (eye.iris.has(idx(sx, sy)) && sy > eye.lidTop) put(buf, x, y, rgba(master, sx, sy));
    else put(buf, x, y, C.cream);
  }
  for (const k of eye.highlights) { const [x, y] = xy(k); if (y > eye.lidTop + lidDrop) copyPx(buf, master, x, y); }
}

const eyeStates = {
  half: (b, e) => lidPatch(b, e, e.lidTop + Math.round((e.y1 - e.lidTop) * 0.45)),
  closed: (b, e) => closedPatch(b, e, "closed"),
  happy: (b, e) => closedPatch(b, e, "happy"),
  "look-left": (b, e) => lookPatch(b, e, -1, 0),
  "look-right": (b, e) => lookPatch(b, e, 1, 0),
  "look-down": (b, e) => lookPatch(b, e, -1, 1, 1),
};

// ---------- Body reconstruction behind the wing ----------

function buildBody() {
  const body = Buffer.from(master);
  const clear = (k) => { const [x, y] = xy(k); put(body, x, y, [0, 0, 0, 0]); };
  for (const k of marks) clear(k);
  for (const k of wing) clear(k);
  // Keep the lower band of the head as underlay so small head moves never open holes at the neck.
  for (const k of head) { const [, y] = xy(k); if (y < 60) clear(k); }
  // Close the robe silhouette where the wing used to cover it: continue the robe, then a 2px outline.
  for (let y = 63; y <= 91; y++) {
    let xr = -1;
    for (let x = 84; x >= 60; x--) if (body[idx(x, y) * 4 + 3]) { xr = x; break; }
    if (xr < 0) continue;
    const wingHere = [...wing].some((k) => { const [wx, wy] = xy(k); return wy === y && wx > xr; });
    if (!wingHere) continue;
    const fill = rgba(body, xr, y);
    const edge = lum(fill) < 60 ? xr : xr + 1;
    if (edge > xr) put(body, edge, y, fill);
    put(body, edge + 1, y, C.outline);
    put(body, edge + 2, y, C.outline);
  }
  return body;
}

const layerFrom = (mask) => { const b = blank(); for (const k of mask) { const [x, y] = xy(k); copyPx(b, master, x, y); } return b; };

// ---------- Page-turn frames (drawn in the book's own palette) ----------

function pageFrame(poly) {
  const b = blank(), fill = new Set();
  for (let y = 50; y < 76; y++) for (let x = 10; x < 60; x++) if (inPoly(poly, x, y)) fill.add(idx(x, y));
  const midY = Math.max(...poly.map((p) => p[1])) - 2;
  for (const k of fill) {
    const [x, y] = xy(k);
    const rightEdge = !fill.has(idx(x + 1, y)) || !fill.has(idx(x, y + 1));
    put(b, x, y, y >= midY || rightEdge ? C.pageShade : C.cream);
  }
  for (const k of fill) {
    const [x, y] = xy(k);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!fill.has(idx(x + dx, y + dy)) && y + dy < 69) put(b, x + dx, y + dy, C.outline);
  }
  return b;
}

const pages = [
  [[34, 68.5], [46, 61.5], [48, 63.5], [37, 69.5]],
  [[31.5, 68.5], [31.5, 60], [35, 57], [35, 68.5]],
  [[31, 68.5], [19, 61.5], [17, 63.5], [28, 69.5]],
];

// ---------- Sparkles ----------

function sparkleFrame(points) {
  const b = blank();
  for (const [x, y, size] of points) {
    const arm = size === "big" ? 2 : 1;
    for (let d = -arm; d <= arm; d++) { put(b, x + d, y, C.gold); put(b, x, y + d, C.gold); }
    put(b, x, y, C.goldLight);
    if (size === "big") { put(b, x - 1, y - 1, C.goldDeep); put(b, x + 1, y + 1, C.goldDeep); }
  }
  return b;
}

// ---------- Write ----------

const eyePatch = (fn) => { const b = blank(); for (const e of eyes) fn(b, e); return b; };

// Order defines the atlas cell of each layer (4 columns × 128px).
const layers = {
  body: buildBody(),
  head: layerFrom(head),
  wing: layerFrom(wing),
  book: layerFrom(book),
  marks: layerFrom(marks),
  ...Object.fromEntries(Object.entries(eyeStates).map(([name, fn]) => [`eyes/${name}`, eyePatch(fn)])),
  ...Object.fromEntries(pages.map((p, i) => [`page/${i + 1}`, pageFrame(p)])),
  "sparkle/1": sparkleFrame([[22, 22, "big"], [104, 28, "small"], [14, 52, "small"], [108, 60, "big"]]),
  "sparkle/2": sparkleFrame([[22, 22, "small"], [104, 28, "big"], [14, 52, "big"], [108, 60, "small"]]),
};

const COLS = 4;
const names = Object.keys(layers);
const rows = Math.ceil(names.length / COLS);
const ATLAS = "public/mascots/sefardlab/spritesheets/classic-atlas.png";
for (const dir of ["eyes", "page", "sparkle"]) mkdirSync(`${OUT}/${dir}`, { recursive: true });
mkdirSync("public/mascots/sefardlab/spritesheets", { recursive: true });

const png = (buf) => sharp(buf, { raw: { width: N, height: N, channels: 4 } }).png({ compressionLevel: 9 });
await Promise.all(names.map((name) => png(layers[name]).toFile(`${OUT}/${name}.png`)));
await sharp({ create: { width: COLS * N, height: rows * N, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(await Promise.all(names.map(async (name, i) => ({ input: await png(layers[name]).toBuffer(), left: (i % COLS) * N, top: Math.floor(i / COLS) * N }))))
  .png({ compressionLevel: 9 })
  .toFile(ATLAS);

const cells = Object.fromEntries(names.map((name, i) => [name, [(i % COLS) * N, Math.floor(i / COLS) * N]]));
const manifest = `// Generated by scripts/build-mascot-layers.mjs — do not edit by hand.
export const MASCOT_SIZE = ${N};
export const MASCOT_ATLAS_URL = "/${ATLAS.replace(/^public\//, "")}";
export const MASCOT_CELLS = ${JSON.stringify(cells)} as const;
export type MascotLayer = keyof typeof MASCOT_CELLS;
export const MASCOT_PIVOTS = { head: [58, ${HEAD_BOTTOM}], wing: [90, 66] } as const;
`;
writeFileSync("lib/mascot/spriteManifest.ts", manifest);
const geometry = { layers: names.length, atlas: ATLAS };

if (DEBUG) {
  const dbg = Buffer.from(master);
  const tint = (mask, c) => { for (const k of mask) { const [x, y] = xy(k); const p = rgba(master, x, y); put(dbg, x, y, [(p[0] + c[0]) / 2, (p[1] + c[1]) / 2, (p[2] + c[2]) / 2, 255]); } };
  tint(head, [255, 0, 0]); tint(wing, [0, 255, 0]); tint(pointer, [0, 0, 255]); tint(marks, [255, 0, 255]); tint(book, [0, 255, 255]);
  for (const e of eyes) tint(e.socket, [255, 255, 0]);
  await sharp(dbg, { raw: { width: N, height: N, channels: 4 } }).resize(N * 6, N * 6, { kernel: "nearest" }).png().toFile(process.env.DEBUG_OUT ?? "mascot-debug.png");
}

console.log("layers written to", OUT, JSON.stringify(geometry));
