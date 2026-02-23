import type { AnimationColorsMap, BackgroundAnimation, BackgroundAnimationLoopParams } from "./types";
import fragmentSource from "./shaders/noiseBkg.glsl";

type ShaderState = {
  program: WebGLProgram;
  positionBuffer: WebGLBuffer;
  positionLocation: number;
  timeLocation: WebGLUniformLocation | null;
  resolutionLocation: WebGLUniformLocation | null;
  pixelRatioLocation: WebGLUniformLocation | null;
  bgLocation: WebGLUniformLocation | null;
  inkLocation: WebGLUniformLocation | null;
  acc1Location: WebGLUniformLocation | null;
  acc2Location: WebGLUniformLocation | null;
};

export class ShaderAnimation implements BackgroundAnimation<WebGLRenderingContext> {
  canvas: HTMLCanvasElement;
  ctx: WebGLRenderingContext;
  private state: ShaderState | null = null;
  private static colorCtx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!ctx) {
      throw new Error("Failed to get WebGL context for background animation.");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.state = this.createState(ctx);
  }

  resize() {
    if (!this.state) {
      return;
    }
    this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.state.resolutionLocation) {
      this.ctx.useProgram(this.state.program);
      this.ctx.uniform2f(
        this.state.resolutionLocation,
        this.canvas.width,
        this.canvas.height
      );
    }
    if (this.state.pixelRatioLocation) {
      this.ctx.useProgram(this.state.program);
      this.ctx.uniform1f(this.state.pixelRatioLocation, window.devicePixelRatio || 1);
    }
  }

  setColors(colors: AnimationColorsMap) {
    if (!this.state) {
      return;
    }

    const { program, bgLocation, inkLocation, acc1Location, acc2Location } = this.state;
    this.ctx.useProgram(program);

    const bg = ShaderAnimation.parseCssColorToRgba01(colors.bg);
    const ink = ShaderAnimation.parseCssColorToRgba01(colors.ink);
    const acc1 = ShaderAnimation.parseCssColorToRgba01(colors.acc1);
    const acc2 = ShaderAnimation.parseCssColorToRgba01(colors.acc2);

    if (bgLocation && bg) this.ctx.uniform4f(bgLocation, bg[0], bg[1], bg[2], bg[3]);
    if (inkLocation && ink) this.ctx.uniform4f(inkLocation, ink[0], ink[1], ink[2], ink[3]);
    if (acc1Location && acc1) this.ctx.uniform4f(acc1Location, acc1[0], acc1[1], acc1[2], acc1[3]);
    if (acc2Location && acc2) this.ctx.uniform4f(acc2Location, acc2[0], acc2[1], acc2[2], acc2[3]);
  }

  destroy() {
    if (!this.state) {
      return;
    }
    this.ctx.deleteBuffer(this.state.positionBuffer);
    this.ctx.deleteProgram(this.state.program);
    this.state = null;
  }

  loop({ time }: BackgroundAnimationLoopParams) {
    if (!this.state) {
      return;
    }
    const { program, timeLocation } = this.state;

    this.ctx.useProgram(program);

    // Upload uniforms used by the fragment shader.
    if (timeLocation) {
      // u_time: float, total seconds since animation start.
      this.ctx.uniform1f(timeLocation, time);
    }
    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 3);
  }

  private createState(ctx: WebGLRenderingContext): ShaderState {
    const vertexSource = `
      attribute vec2 a_position;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Shader uses u_time (float) and u_resolution (vec2) uniforms.
    const program = this.createProgram(ctx, vertexSource, fragmentSource);
    const positionBuffer = ctx.createBuffer();
    if (!positionBuffer) {
      throw new Error("Failed to create WebGL position buffer.");
    }

    ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1, -1,
      3, -1,
      -1, 3,
    ]);
    ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

    const positionLocation = ctx.getAttribLocation(program, "a_position");
    const timeLocation = ctx.getUniformLocation(program, "u_time");
    const resolutionLocation = ctx.getUniformLocation(program, "u_resolution");
    const pixelRatioLocation = ctx.getUniformLocation(program, "u_pixel_ratio");

    const bgLocation = ctx.getUniformLocation(program, "c_bg");
    const inkLocation = ctx.getUniformLocation(program, "c_ink");
    const acc1Location = ctx.getUniformLocation(program, "c_acc1");
    const acc2Location = ctx.getUniformLocation(program, "c_acc2");

    ctx.useProgram(program);
    ctx.enableVertexAttribArray(positionLocation);
    ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 0, 0);

    return {
      program,
      positionBuffer,
      positionLocation,
      timeLocation,
      resolutionLocation,
      pixelRatioLocation,
      bgLocation,
      inkLocation,
      acc1Location,
      acc2Location,
    };
  }

  private static parseCssColorToRgba01(input: string): [number, number, number, number] | null {
    const ctx = ShaderAnimation.getColorContext();
    if (!ctx) return null;

    // Invalid CSS colors keep the previous fillStyle; use a sentinel to detect.
    const sentinel = "rgba(1, 2, 3, 0.4)";
    ctx.fillStyle = sentinel;
    ctx.fillStyle = input;
    if (String(ctx.fillStyle) === sentinel && input.trim() !== sentinel) {
      return null;
    }

    ctx.clearRect(0, 0, 1, 1);
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, 1, 1);

    const data = ctx.getImageData(0, 0, 1, 1).data;
    const r = data[0] ?? 0;
    const g = data[1] ?? 0;
    const b = data[2] ?? 0;
    const a = data[3] ?? 0;
    return [r / 255, g / 255, b / 255, a / 255];
  }

  private static getColorContext(): CanvasRenderingContext2D | null {
    if (ShaderAnimation.colorCtx) return ShaderAnimation.colorCtx;
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ShaderAnimation.colorCtx = ctx;
    return ctx;
  }

  private createProgram(
    ctx: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    const vertexShader = this.compileShader(ctx, ctx.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(ctx, ctx.FRAGMENT_SHADER, fragmentSource);

    const program = ctx.createProgram();
    if (!program) {
      throw new Error("Failed to create WebGL program.");
    }

    ctx.attachShader(program, vertexShader);
    ctx.attachShader(program, fragmentShader);
    ctx.linkProgram(program);

    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      const info = ctx.getProgramInfoLog(program);
      ctx.deleteProgram(program);
      ctx.deleteShader(vertexShader);
      ctx.deleteShader(fragmentShader);
      throw new Error(`Failed to link WebGL program: ${info ?? "unknown"}`);
    }

    return program;
  }

  private compileShader(
    ctx: WebGLRenderingContext,
    type: number,
    source: string
  ) {
    const shader = ctx.createShader(type);
    if (!shader) {
      throw new Error("Failed to create WebGL shader.");
    }

    ctx.shaderSource(shader, source);
    ctx.compileShader(shader);

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(shader);
      ctx.deleteShader(shader);
      throw new Error(`Failed to compile WebGL shader: ${info ?? "unknown"}`);
    }

    return shader;
  }
}
