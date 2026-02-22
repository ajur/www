precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float wave = sin((uv.x + uv.y) * 10.0 + u_time * 0.9) * 0.5 + 0.5;
  vec3 base = mix(vec3(0.05, 0.07, 0.12), vec3(0.25, 0.55, 0.75), wave);
  float vignette = smoothstep(0.9, 0.2, length(uv - 0.5));
  gl_FragColor = vec4(base * vignette, 1.0);
}
