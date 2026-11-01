export type EyeState = "open" | "half" | "closed" | "happy" | "look-left" | "look-right" | "look-down";

export interface Pose {
  eyes: EyeState;
  head: { angle: number; dy: number };
  wing: { angle: number; dy: number };
  page: 0 | 1 | 2 | 3;
  marks: boolean;
  sparkle: 0 | 1 | 2;
}

export type MascotAnimationState =
  | "idle"
  | "blink"
  | "look-left"
  | "look-right"
  | "reading"
  | "teaching"
  | "happy"
  | "doubt"
  | "enter"
  | "exit";

export type MascotAction = Exclude<MascotAnimationState, "idle">;

type PosePatch = {
  eyes?: EyeState;
  head?: Partial<Pose["head"]>;
  wing?: Partial<Pose["wing"]>;
  page?: Pose["page"];
  marks?: boolean;
  sparkle?: Pose["sparkle"];
};

/** A step timeline: each key holds until the next one. `duration` ends the action. */
export interface Timeline {
  duration: number;
  keys: ReadonlyArray<readonly [ms: number, patch: PosePatch]>;
  /** Natural blinks may play over this action. */
  allowBlink: boolean;
  /** Breathing keeps going underneath this action. */
  breathing: boolean;
  /** Pose shown instead of the timeline when the user prefers reduced motion. */
  still: PosePatch;
}

export const NEUTRAL: Pose = {
  eyes: "open",
  head: { angle: 0, dy: 0 },
  wing: { angle: 0, dy: 0 },
  page: 0,
  marks: true,
  sparkle: 0,
};

const BLINK_KEYS = [
  [0, { eyes: "half" }],
  [40, { eyes: "closed" }],
  [95, { eyes: "half" }],
  [135, { eyes: "open" }],
] as const;

export const TIMELINES: Record<MascotAction, Timeline> = {
  blink: { duration: 150, keys: BLINK_KEYS, allowBlink: false, breathing: true, still: {} },

  "look-left": {
    duration: 1100,
    keys: [
      [0, { eyes: "look-left" }],
      [1000, { eyes: "open" }],
    ],
    allowBlink: true,
    breathing: true,
    still: { eyes: "look-left" },
  },

  "look-right": {
    duration: 1100,
    keys: [
      [0, { eyes: "look-right" }],
      [1000, { eyes: "open" }],
    ],
    allowBlink: true,
    breathing: true,
    still: { eyes: "look-right" },
  },

  reading: {
    duration: 2300,
    keys: [
      [0, { eyes: "look-down", head: { angle: -1 } }],
      [120, { head: { angle: -2 } }],
      [650, { page: 1 }],
      [740, { page: 2 }],
      [830, { page: 3 }],
      [920, { page: 0 }],
      [1250, { eyes: "half" }],
      [1290, { eyes: "closed" }],
      [1345, { eyes: "half" }],
      [1385, { eyes: "look-down" }],
      [1850, { eyes: "open", head: { angle: -1 } }],
      [2000, { head: { angle: 0 } }],
    ],
    allowBlink: false,
    breathing: true,
    still: { eyes: "look-down", head: { angle: -2 } },
  },

  teaching: {
    duration: 1350,
    keys: [
      [0, { wing: { angle: -3, dy: -1 }, marks: false }],
      [70, { wing: { angle: -6, dy: -2 }, head: { angle: 1 } }],
      [140, { wing: { angle: -9, dy: -2 }, eyes: "look-right" }],
      [420, { wing: { angle: -2, dy: -2 }, marks: true }],
      [490, { wing: { angle: 4, dy: -1 } }],
      [580, { wing: { angle: -2, dy: -2 }, marks: false }],
      [650, { wing: { angle: 4, dy: -1 }, marks: true }],
      [900, { wing: { angle: -2, dy: -1 }, head: { angle: 0 }, eyes: "open" }],
      [1000, { wing: { angle: 0, dy: 0 } }],
    ],
    allowBlink: true,
    breathing: false,
    still: { wing: { angle: -6, dy: -2 } },
  },

  happy: {
    duration: 950,
    keys: [
      [0, { eyes: "happy", wing: { angle: -4, dy: -1 }, head: { angle: 1 }, sparkle: 1 }],
      [90, { wing: { angle: -8, dy: -2 }, head: { angle: 2 } }],
      [200, { sparkle: 2 }],
      [330, { sparkle: 1 }],
      [460, { sparkle: 2, wing: { angle: -4, dy: -1 }, head: { angle: 1 } }],
      [600, { sparkle: 0, wing: { angle: 0, dy: 0 }, head: { angle: 0 } }],
      [850, { eyes: "open" }],
    ],
    allowBlink: false,
    breathing: false,
    still: { eyes: "happy", sparkle: 1 },
  },

  doubt: {
    duration: 1300,
    keys: [
      [0, { eyes: "look-left", head: { angle: -1 } }],
      [80, { head: { angle: -2 } }],
      [450, { eyes: "look-right", head: { angle: -1 } }],
      [530, { head: { angle: 1 } }],
      [900, { eyes: "open", head: { angle: 0 } }],
    ],
    allowBlink: false,
    breathing: true,
    still: { eyes: "look-left", head: { angle: -2 } },
  },

  enter: {
    duration: 420,
    keys: [
      [0, { eyes: "closed" }],
      [260, { eyes: "half" }],
      [330, { eyes: "open" }],
    ],
    allowBlink: false,
    breathing: false,
    still: {},
  },

  exit: {
    duration: 360,
    keys: [
      [0, { eyes: "half" }],
      [60, { eyes: "closed" }],
    ],
    allowBlink: false,
    breathing: false,
    still: { eyes: "closed" },
  },
};

/** Idle-only head tilt, never requested from outside. */
export const AMBIENT_TILT: Timeline = {
  duration: 1500,
  keys: [
    [0, { head: { angle: 1 } }],
    [110, { head: { angle: 2 } }],
    [220, { head: { angle: 3 } }],
    [1050, { head: { angle: 2 } }],
    [1160, { head: { angle: 1 } }],
    [1270, { head: { angle: 0 } }],
  ],
  allowBlink: true,
  breathing: true,
  still: {},
};

export const BREATH_PERIOD = 2600;

export function applyPatch(pose: Pose, patch: PosePatch): Pose {
  return {
    eyes: patch.eyes ?? pose.eyes,
    head: { ...pose.head, ...patch.head },
    wing: { ...pose.wing, ...patch.wing },
    page: patch.page ?? pose.page,
    marks: patch.marks ?? pose.marks,
    sparkle: patch.sparkle ?? pose.sparkle,
  };
}

/** Pose of a timeline at `elapsed` ms (keys accumulate, like held animation frames). */
export function sampleTimeline(timeline: Timeline, elapsed: number): Pose {
  let pose = NEUTRAL;
  for (const [ms, patch] of timeline.keys) {
    if (ms > elapsed) break;
    pose = applyPatch(pose, patch);
  }
  return pose;
}

export function sampleBlink(elapsed: number): EyeState | null {
  if (elapsed < 0 || elapsed >= TIMELINES.blink.duration) return null;
  let eyes: EyeState = "open";
  for (const [ms, patch] of BLINK_KEYS) if (ms <= elapsed) eyes = patch.eyes;
  return eyes;
}

export const poseKey = (p: Pose) =>
  `${p.eyes}|${p.head.angle}|${p.head.dy}|${p.wing.angle}|${p.wing.dy}|${p.page}|${p.marks ? 1 : 0}|${p.sparkle}`;
