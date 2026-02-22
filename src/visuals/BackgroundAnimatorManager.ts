import { ShaderAnimation } from "./ShaderAnimation";
import type { BackgroundAnimation } from "./types";

export class BackgroundAnimatorManager {
  private container: Element;
  private animation: BackgroundAnimation | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private rafId: number | null = null;
  private resizeHandler: () => void = () => {};
  private mouseMoveHandler: (ev: MouseEvent) => any = () => {};
  private visualViewport: VisualViewport | null = null;

  constructor(
    container: Element,
    private animationFactory: (canvas: HTMLCanvasElement) => BackgroundAnimation =
      (canvas) => new ShaderAnimation(canvas)
  ) {
    this.container = container;
  }

  start() {
    const canvas = document.createElement("canvas");
    this.container.appendChild(canvas);
    this.canvas = canvas;
    this.animation = this.animationFactory(canvas);
    this.resizeHandler = () => this.resize(canvas);
    window.addEventListener("resize", this.resizeHandler, { passive: true });
    this.visualViewport = window.visualViewport ?? null;
    this.visualViewport?.addEventListener("resize", this.resizeHandler, { passive: true });
    this.visualViewport?.addEventListener("scroll", this.resizeHandler, { passive: true });
    this.resizeHandler();

    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.max(0, (time - lastTime) / 1000);
      lastTime = time;
      if (!this.animation) {
        return;
      }
      this.animation.loop({
        width: canvas.width,
        height: canvas.height,
        time: time / 1000,
        dt,
      });
      this.rafId = window.requestAnimationFrame(loop);
    };
    this.rafId = window.requestAnimationFrame(loop);
  }

  destroy() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.animation) {
      this.animation.destroy?.();
    }
    if (this.canvas?.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    window.removeEventListener("resize", this.resizeHandler);
    this.visualViewport?.removeEventListener("resize", this.resizeHandler);
    this.visualViewport?.removeEventListener("scroll", this.resizeHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
    this.animation = null;
    this.canvas = null;
    this.visualViewport = null;
  }

  private resize(canvas: HTMLCanvasElement) {
    const ratio = window.devicePixelRatio || 1;
    const rect = (this.container as HTMLElement).getBoundingClientRect?.();
    const width = Math.max(1, Math.round(rect?.width || window.innerWidth));
    const height = Math.max(1, Math.round(rect?.height || window.innerHeight));

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.animation?.resize?.();
  }
}
