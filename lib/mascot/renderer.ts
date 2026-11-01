import type { Pose } from "./animations";
import { blit, rotatePixels, type Pixels } from "./pixel";
import { MASCOT_ATLAS_URL, MASCOT_CELLS, MASCOT_PIVOTS, MASCOT_SIZE, type MascotLayer } from "./spriteManifest";

const N = MASCOT_SIZE;

type Layers = Record<MascotLayer, Pixels>;

let atlasPromise: Promise<Layers> | null = null;

/** Loads the sprite atlas once per page and slices it into per-layer pixel buffers. */
export function loadMascotLayers(): Promise<Layers> {
  atlasPromise ??= new Promise<Layers>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("2D canvas unavailable"));
      ctx.drawImage(img, 0, 0);
      const layers = {} as Layers;
      for (const [name, [x, y]] of Object.entries(MASCOT_CELLS) as [MascotLayer, readonly [number, number]][]) {
        layers[name] = ctx.getImageData(x, y, N, N).data;
      }
      resolve(layers);
    };
    img.onerror = () => {
      atlasPromise = null;
      reject(new Error(`Could not load ${MASCOT_ATLAS_URL}`));
    };
    img.src = MASCOT_ATLAS_URL;
  });
  return atlasPromise;
}

export class MascotRenderer {
  private heads = new Map<string, Pixels>();
  private wings = new Map<number, Pixels>();
  private frame = new ImageData(N, N);

  constructor(private layers: Layers) {}

  private head(eyes: Pose["eyes"], angle: number): Pixels {
    const key = `${eyes}|${angle}`;
    let px = this.heads.get(key);
    if (!px) {
      const base = new Uint8ClampedArray(this.layers.head);
      if (eyes !== "open") blit(base, this.layers[`eyes/${eyes}`], N);
      px = rotatePixels(base, N, angle, MASCOT_PIVOTS.head);
      this.heads.set(key, px);
    }
    return px;
  }

  private wing(angle: number): Pixels {
    let px = this.wings.get(angle);
    if (!px) {
      px = rotatePixels(this.layers.wing, N, angle, MASCOT_PIVOTS.wing);
      this.wings.set(angle, px);
    }
    return px;
  }

  compose(pose: Pose): ImageData {
    const out = this.frame.data;
    out.fill(0);
    blit(out, this.layers.body, N);
    blit(out, this.head(pose.eyes, pose.head.angle), N, 0, pose.head.dy);
    blit(out, this.wing(pose.wing.angle), N, 0, pose.wing.dy);
    if (pose.marks) blit(out, this.layers.marks, N, 0, pose.wing.dy);
    blit(out, this.layers.book, N);
    if (pose.page) blit(out, this.layers[`page/${pose.page}`], N);
    if (pose.sparkle) blit(out, this.layers[`sparkle/${pose.sparkle}`], N);
    return this.frame;
  }
}
