import type { BackgroundAnimation, BackgroundAnimationLoopParams } from "./types";

export class CanvasAnimation implements BackgroundAnimation<CanvasRenderingContext2D> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context for background animation.");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  destroy() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  loop({ width, height }: BackgroundAnimationLoopParams) {
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = "#ffffff0f";
    this.ctx.fillRect(0, 0, width / 2, height / 2);
    this.ctx.fillRect(width / 2, height / 2, width / 2, height / 2);
  };
}
