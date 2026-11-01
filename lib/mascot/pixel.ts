export type Pixels = Uint8ClampedArray;
export type Point = readonly [number, number];

// The source art has many near-identical shades; treat them as one color when detecting edges.
const SIMILAR = 48;

function similar(src: Pixels, a: number, b: number): boolean {
  if (src[a + 3] === 0 || src[b + 3] === 0) return src[a + 3] === src[b + 3];
  return Math.abs(src[a] - src[b]) + Math.abs(src[a + 1] - src[b + 1]) + Math.abs(src[a + 2] - src[b + 2]) < SIMILAR;
}

/** Scale2x (EPX): doubles resolution, rounding diagonal steps without inventing colors. Returns source pixel offsets. */
function scale2x(src: Pixels, refs: Int32Array, size: number): Int32Array {
  const out = new Int32Array(size * 2 * size * 2);
  const at = (x: number, y: number) => refs[Math.min(size - 1, Math.max(0, y)) * size + Math.min(size - 1, Math.max(0, x))];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const p = at(x, y), a = at(x, y - 1), b = at(x + 1, y), c = at(x - 1, y), d = at(x, y + 1);
      const s = (u: number, v: number) => similar(src, u, v);
      const o = (y * 2 * size * 2) + x * 2;
      out[o] = s(c, a) && !s(c, d) && !s(a, b) ? a : p;
      out[o + 1] = s(a, b) && !s(a, c) && !s(b, d) ? b : p;
      out[o + size * 2] = s(d, c) && !s(d, b) && !s(c, a) ? c : p;
      out[o + size * 2 + 1] = s(b, d) && !s(b, a) && !s(d, c) ? d : p;
    }
  }
  return out;
}

/**
 * RotSprite-style rotation: 4× Scale2x, inverse nearest-neighbour sampling, back to 1×.
 * Keeps thin outlines connected and never introduces colors that are not in the sprite.
 */
export function rotatePixels(src: Pixels, size: number, degrees: number, [px, py]: Point): Pixels {
  if (degrees === 0) return src;
  const base = new Int32Array(size * size);
  for (let i = 0; i < base.length; i++) base[i] = i * 4;
  const big = scale2x(src, scale2x(src, base, size), size * 2);
  const S = size * 4;
  const a = (-degrees * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const cx = (px + 0.5) * 4, cy = (py + 0.5) * 4;
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) * 4 - cx, dy = (y + 0.5) * 4 - cy;
      const sx = Math.floor(cx + dx * cos - dy * sin);
      const sy = Math.floor(cy + dx * sin + dy * cos);
      if (sx < 0 || sy < 0 || sx >= S || sy >= S) continue;
      const i = big[sy * S + sx];
      if (src[i + 3] === 0) continue;
      const j = (y * size + x) * 4;
      out[j] = src[i];
      out[j + 1] = src[i + 1];
      out[j + 2] = src[i + 2];
      out[j + 3] = 255;
    }
  }
  return out;
}

/** Copies opaque pixels of `src` onto `dst`, shifted by whole pixels. */
export function blit(dst: Pixels, src: Pixels, size: number, ox = 0, oy = 0): void {
  for (let y = 0; y < size; y++) {
    const ty = y + oy;
    if (ty < 0 || ty >= size) continue;
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (src[i + 3] === 0) continue;
      const tx = x + ox;
      if (tx < 0 || tx >= size) continue;
      const j = (ty * size + tx) * 4;
      dst[j] = src[i];
      dst[j + 1] = src[i + 1];
      dst[j + 2] = src[i + 2];
      dst[j + 3] = 255;
    }
  }
}
