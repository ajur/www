import type { BackgroundAnimation, BackgroundAnimationLoopParams } from "./types";
import fragmentSource from "./shaders/noiseBkg.glsl";

type ShaderState = {
  program: WebGLProgram;
  positionBuffer: WebGLBuffer;
  positionLocation: number;
  timeLocation: WebGLUniformLocation | null;
  resolutionLocation: WebGLUniformLocation | null;
  pixelRatioLocation: WebGLUniformLocation | null;
};

export class ShaderAnimation implements BackgroundAnimation<WebGLRenderingContext> {
  canvas: HTMLCanvasElement;
  ctx: WebGLRenderingContext;
  private state: ShaderState | null = null;

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
    };
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
