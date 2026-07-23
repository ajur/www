import { ShaderAnimation } from "./ShaderAnimation";
import type {
  BackgroundAnimation,
  BackgroundAnimatorOptions,
  BackgroundQuietZone,
} from "./types";

export class BackgroundAnimatorManager {
  private container: Element;
  private animation: BackgroundAnimation | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private rafId: number | null = null;
  private resizeHandler: () => void = () => {};
  private scrollHandler: () => void = () => {};
  private mouseMoveHandler: (ev: MouseEvent) => any = () => {};
  private visualViewport: VisualViewport | null = null;
  private quietZoneDirty = false;
  private quietTargetElement: Element | null = null;
  private quietTargetResizeObserver: ResizeObserver | null = null;
  readonly mode;
  readonly quietTarget;

  constructor(
    container: Element,
    options: BackgroundAnimatorOptions = {},
    private animationFactory: (canvas: HTMLCanvasElement) => BackgroundAnimation =
      (canvas) => new ShaderAnimation(canvas)
  ) {
    this.container = container;
    this.mode = options.mode ?? "full";
    this.quietTarget = options.quietTarget ?? "main";
  }

  start() {
    if (this.mode === "none") {
      return;
    }

    const canvas = document.createElement("canvas");
    this.container.setAttribute("data-bkg-mode", this.mode);
    this.container.setAttribute("data-bkg-quiet-target", this.quietTarget);
    this.container.appendChild(canvas);
    this.canvas = canvas;
    this.animation = this.animationFactory(canvas);
    this.resizeHandler = () => {
      this.resize(canvas);
      if (this.mode === "quiet") {
        this.markQuietZoneDirty();
      }
    };
    window.addEventListener("resize", this.resizeHandler, { passive: true });
    window.addEventListener("themechanged", this.updateThemeColors, { passive: true });
    this.visualViewport = window.visualViewport ?? null;
    this.visualViewport?.addEventListener("resize", this.resizeHandler, { passive: true });

    if (this.mode === "quiet") {
      this.scrollHandler = () => this.markQuietZoneDirty();
      window.addEventListener("scroll", this.scrollHandler, { passive: true });
      this.visualViewport?.addEventListener("scroll", this.scrollHandler, { passive: true });
      this.resolveQuietTarget();
    } else {
      this.animation.setQuietZone?.(null);
    }

    this.resizeHandler();
    this.updateThemeColors();
    if (this.mode === "quiet") {
      this.updateQuietZone();
    }

    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.max(0, (time - lastTime) / 1000);
      lastTime = time;
      if (!this.animation) {
        return;
      }
      if (this.mode === "quiet" && this.quietZoneDirty) {
        this.updateQuietZone();
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
    window.removeEventListener("scroll", this.scrollHandler);
    this.visualViewport?.removeEventListener("resize", this.resizeHandler);
    this.visualViewport?.removeEventListener("scroll", this.scrollHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
    window.removeEventListener("themechanged", this.updateThemeColors);
    this.quietTargetResizeObserver?.disconnect();

    this.animation = null;
    this.canvas = null;
    this.visualViewport = null;
    this.quietTargetElement = null;
    this.quietTargetResizeObserver = null;
    this.quietZoneDirty = false;
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

  private markQuietZoneDirty() {
    this.quietZoneDirty = true;
  }

  private resolveQuietTarget() {
    this.quietTargetElement = null;
    this.quietTargetResizeObserver?.disconnect();
    this.quietTargetResizeObserver = null;

    try {
      this.quietTargetElement = document.querySelector(this.quietTarget);
    } catch {
      return;
    }

    if (this.quietTargetElement && "ResizeObserver" in window) {
      this.quietTargetResizeObserver = new ResizeObserver(() => this.markQuietZoneDirty());
      this.quietTargetResizeObserver.observe(this.quietTargetElement);
    }
  }

  private updateQuietZone() {
    if (!this.animation?.setQuietZone) {
      this.quietZoneDirty = false;
      return;
    }

    if (!this.quietTargetElement) {
      this.animation.setQuietZone(null);
      this.quietZoneDirty = false;
      return;
    }

    const containerRect = (this.container as HTMLElement).getBoundingClientRect?.();
    const targetRect = (this.quietTargetElement as HTMLElement).getBoundingClientRect?.();

    if (!containerRect || !targetRect || containerRect.width <= 0 || containerRect.height <= 0) {
      this.animation.setQuietZone(null);
      this.quietZoneDirty = false;
      return;
    }

    const clippedLeft = Math.max(containerRect.left, targetRect.left);
    const clippedTop = Math.max(containerRect.top, targetRect.top);
    const clippedRight = Math.min(containerRect.right, targetRect.right);
    const clippedBottom = Math.min(containerRect.bottom, targetRect.bottom);

    if (clippedLeft >= clippedRight || clippedTop >= clippedBottom) {
      this.animation.setQuietZone(null);
      this.quietZoneDirty = false;
      return;
    }

    const quietZone: BackgroundQuietZone = {
      left: (clippedLeft - containerRect.left) / containerRect.width,
      top: (clippedTop - containerRect.top) / containerRect.height,
      right: (clippedRight - containerRect.left) / containerRect.width,
      bottom: (clippedBottom - containerRect.top) / containerRect.height,
      feather: Math.min(0.12, 48 / Math.min(containerRect.width, containerRect.height)),
    };

    this.animation.setQuietZone(quietZone);
    this.quietZoneDirty = false;
  }

  updateThemeColors = () => {
    const styles = getComputedStyle(document.documentElement);
    this.animation?.setColors?.({
      bg: styles.getPropertyValue("--color-bg").trim(),
      ink: styles.getPropertyValue("--color-ink").trim(),
      acc1: styles.getPropertyValue("--color-link").trim(),
      acc2: styles.getPropertyValue("--color-link-strong").trim(),
    });
  }
}
