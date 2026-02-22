
export type BackgroundAnimationLoopParams = {
  width: number;
  height: number;
  time: number; // Total time in seconds since animation started
  dt: number; // Time delta in seconds since last frame
}

export type BackgroundAnimation<TContext extends RenderingContext = RenderingContext> = {
  canvas: HTMLCanvasElement;
  ctx: TContext;
  resize?: () => void;
  loop: (params: BackgroundAnimationLoopParams) => void;
  destroy?: () => void;
}
