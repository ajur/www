
export type BackgroundAnimationLoopParams = {
  width: number;
  height: number;
  time: number; // Total time in seconds since animation started
  dt: number; // Time delta in seconds since last frame
}

export type BackgroundAnimatorMode = "full" | "quiet" | "none";

export type BackgroundAnimatorOptions = {
  mode?: BackgroundAnimatorMode;
  quietTarget?: string;
}

export type BackgroundQuietZone = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  feather: number;
}

export type AnimationColors = "bg" | "ink" | "acc1" | "acc2";
export type AnimationColorsMap = Record<AnimationColors, string>;

export type BackgroundAnimation<TContext extends RenderingContext = RenderingContext> = {
  canvas: HTMLCanvasElement;
  ctx: TContext;
  resize?: () => void;
  loop: (params: BackgroundAnimationLoopParams) => void;
  destroy?: () => void;
  setColors?: (colors: AnimationColorsMap) => void;
  setQuietZone?: (quietZone: BackgroundQuietZone | null) => void;
}
