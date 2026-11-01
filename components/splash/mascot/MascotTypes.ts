export type MascotVariant =
  | "classic"
  | "sefardi"
  | "developer"
  | "student"
  | "master"
  | "gamification";

export type AnimationState =
  | "idle"
  | "enter"
  | "loading"
  | "success"
  | "exit"
  | "error";

export interface MascotConfig {
  variant: MascotVariant;
  state: AnimationState;
  message?: string;
  showProgress?: boolean;
}

export interface AnimationKeyframes {
  name: string;
  duration: number; // ms
  easing: string;
  frames: Record<string, unknown>[];
}
