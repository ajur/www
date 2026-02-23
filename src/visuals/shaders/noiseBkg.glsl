precision mediump float;

#include simplexNoise.glsl;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_pixel_ratio;

uniform vec4 c_bg;
uniform vec4 c_ink;
uniform vec4 c_acc1;
uniform vec4 c_acc2;

// demo code:
float noiseVal(vec2 xy) { return 0.7 * snoise(vec3(xy, 0.1 * u_time)); }

vec3 noiseColor() {
  vec2 p = (gl_FragCoord.xy / u_resolution.y) * 2.0 - 1.0;

  vec3 xyz = vec3(p, 0.0);

  vec2 step = vec2(1.3, 1.7);
  float n = noiseVal(xyz.xy);
  n += 0.5 * noiseVal(xyz.xy * 2.0 - step);
  n += 0.25 * noiseVal(xyz.xy * 4.0 - 2.0 * step);
  n += 0.125 * noiseVal(xyz.xy * 8.0 - 3.0 * step);
  // n += 0.0625 * noiseVal(xyz.xy * 16.0 - 4.0 * step);
  // n += 0.03125 * noiseVal(xyz.xy * 32.0 - 5.0 * step);

  float t = clamp(0.5 + 0.5 * n, 0.0, 1.0);
  float tUp = smoothstep(0.5, 1.0, t);
  float tDown = smoothstep(0.0, 0.5, t);
  return (t >= 0.5
    ? mix(c_bg.rgb, c_acc2.rgb, tUp)
    : mix(c_acc1.rgb, c_bg.rgb, tDown));
}

void main() {
  // compute dots
  float spacing = floor(9.0 * u_pixel_ratio + 0.5);
  float dotRadius = max(1.0, floor(1.5 * u_pixel_ratio + 0.5));
  float rowHeight = spacing * 0.86602540378; // sqrt(3)/2 for hex spacing
  vec2 pos = gl_FragCoord.xy;
  float row = floor(pos.y / rowHeight);
  float offset = mod(row, 2.0) * 0.5 * spacing;
  float col = floor((pos.x - offset) / spacing);
  vec2 center = vec2((col + 0.5) * spacing + offset, (row + 0.5) * rowHeight);
  float distToCenter = length(pos - center);
  float isDot = 1.0 - smoothstep(dotRadius, dotRadius + 1.0, distToCenter);

  // noise color for dots background
  vec3 color = (isDot > 0.0) ? noiseColor() : c_bg.rgb;

  gl_FragColor = vec4(color, 1.0);
}
