// GLSL for the Liquidity hero. Three programs share one studio model:
// backdrop (seamless sweep + floor + contact shadows), liquid (raymarched
// metaball chrome), and the defocused foreground droplet.

export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const COMMON = /* glsl */ `
#define NS 7
uniform vec4 uSph[NS];
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 uCamTgt;
uniform float uTanH;

const float WALL = 6.5;              // distance from the pool to the sweep's wall
const vec3 C_TOP   = vec3(0.937, 0.929, 0.914);
const vec3 C_SEAM  = vec3(0.902, 0.890, 0.871); // #e6e3de
const vec3 C_FLOOR = vec3(0.835, 0.818, 0.792);
const vec3 KEY = vec3(-0.42, 1.0, 0.38);        // key light direction (normalised in use)

vec3 camRay(vec2 frag, out vec3 ro) {
  vec2 uv = (frag * 2.0 - uRes) / uRes.y;
  vec3 fw = normalize(uCamTgt - uCamPos);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  ro = uCamPos;
  return normalize(fw + uTanH * (uv.x * rt + uv.y * up));
}

// Soft contact shadow on the floor: analytic sphere occlusion + a soft key shadow.
float floorShadow(vec3 f) {
  float occ = 0.0;
  float key = 0.0;
  vec3 L = normalize(KEY);
  for (int i = 0; i < NS; i++) {
    vec4 s = uSph[i];
    if (s.w < 0.002) continue;
    vec3 d = s.xyz - f;
    float l2 = dot(d, d);
    float l = sqrt(l2);
    occ += 0.62 * s.w * s.w / l2 * clamp(d.y / l, 0.0, 1.0);
    vec2 cp = s.xz - L.xz / L.y * s.y;
    float dd = length(f.xz - cp);
    key = max(key, 1.0 - smoothstep(s.w * 0.1, s.w * 1.9, dd));
  }
  return exp(-1.25 * occ) * (1.0 - 0.22 * key);
}

vec3 floorColor(vec3 f) {
  float u = f.z + WALL;                       // 0 at the seam
  vec3 c = mix(C_SEAM, C_FLOOR, smoothstep(0.0, 15.0, u));
  c *= 1.0 + 0.035 * exp(-f.x * f.x * 0.02 - (f.z + 1.0) * (f.z + 1.0) * 0.03); // light pool
  return c * floorShadow(f);
}

vec3 wallColor(vec3 w) {
  return mix(C_SEAM, C_TOP, smoothstep(0.0, 8.0, w.y));
}

void frameOf(vec3 c, out vec3 u, out vec3 v) {
  u = abs(c.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : normalize(cross(vec3(0.0, 1.0, 0.0), c));
  v = cross(c, u);
}

// Rounded soft rectangle seen from direction d (a softbox or a flag).
float panel(vec3 d, vec3 c, vec2 hs, float fe, out vec2 q) {
  c = normalize(c);
  float dc = dot(d, c);
  q = vec2(0.0);
  if (dc <= 0.05) return 0.0;
  vec3 u, v;
  frameOf(c, u, v);
  q = vec2(dot(d, u), dot(d, v)) / dc;
  vec2 e = abs(q) - hs + 0.06;
  float dist = length(max(e, 0.0)) + min(max(e.x, e.y), 0.0) - 0.06;
  return 1.0 - smoothstep(-fe, fe, dist);
}
float panel(vec3 d, vec3 c, vec2 hs, float fe) { vec2 q; return panel(d, c, hs, fe, q); }

// The studio as seen by a reflection ray leaving point ro.
vec3 studio(vec3 ro, vec3 d, float rough) {
  vec3 col;
  if (d.y < 0.0) {
    vec3 f = ro + d * (-ro.y / min(d.y, -1e-4));
    col = floorColor(f);
  } else {
    col = wallColor(vec3(0.0, d.y * 9.0, 0.0));
    // the photographer's side of the studio is darker: this is what reads as chrome
    float back = smoothstep(-0.25, 0.75, d.z);
    col *= mix(1.0, 0.36, back);
    col *= 1.0 - 0.18 * smoothstep(0.02, 0.0, d.y) * (1.0 - back); // horizon line
  }
  float fe = 0.012 + rough * 0.42;
  col += vec3(1.9) * panel(d, vec3(0.05, 1.0, 0.22), vec2(0.62, 0.34), fe);   // overhead box
  col += vec3(2.6) * panel(d, vec3(-0.85, 0.32, 0.42), vec2(0.17, 0.72), fe); // key strip
  col += vec3(2.1) * panel(d, vec3(0.92, 0.28, -0.3), vec2(0.1, 0.62), fe);   // rim strip
  col += vec3(1.25) * panel(d, vec3(0.25, 0.12, 1.0), vec2(0.8, 0.035), fe);  // low front kicker
  col *= 1.0 - 0.82 * panel(d, vec3(0.62, 0.06, 0.78), vec2(0.34, 0.5), fe + 0.04); // black flag
  col *= 1.0 - 0.55 * panel(d, vec3(-0.75, 0.05, -0.6), vec2(0.28, 0.4), fe + 0.04);
  return col;
}

vec3 shoulder(vec3 c) {
  // keep greys untouched, roll highlights into white
  vec3 x = max(c - 0.85, 0.0);
  return min(c, vec3(0.85)) + 0.15 * (1.0 - exp(-x / 0.15));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
`;

export const BACKDROP_FRAG = /* glsl */ `#version 300 es
precision highp float;
${COMMON}
uniform float uFade; // flattens the room into the stub colour at the end
out vec4 o;
void main() {
  vec3 ro;
  vec3 rd = camRay(gl_FragCoord.xy, ro);
  vec3 col;
  float tf = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  vec3 f = ro + rd * tf;
  if (f.z > -WALL && tf < 1e8) {
    col = floorColor(f);
  } else {
    float tw = (-WALL - ro.z) / min(rd.z, -1e-4);
    col = wallColor(ro + rd * tw);
  }
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - 0.07 * dot(uv, uv) * 2.0;
  col = mix(col, C_SEAM, uFade);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.018;
  o = vec4(col, 1.0);
}
`;

export const LIQUID_FRAG = /* glsl */ `#version 300 es
precision highp float;
${COMMON}
uniform vec4 uVel[NS];
uniform float uK;
uniform float uWob;
uniform vec3 uPtr;
uniform float uPtrAmt;
uniform vec4 uRip[4];
uniform sampler2D uVid;
uniform float uVidMix;
out vec4 o;

const float SAG = 1.22;

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float drop(vec3 p, int i) {
  vec4 s = uSph[i];
  vec3 q = p - s.xyz;
  // stretch along velocity (elongated while it travels)
  vec3 v = uVel[i].xyz;
  float sp = length(v);
  if (sp > 0.001) {
    vec3 n = v / sp;
    float st = 1.0 / (1.0 + min(sp, 3.0) * 0.16);
    q += n * dot(q, n) * (st - 1.0);
  }
  // lean the crown toward the pointer
  vec3 toP = uPtr - s.xyz;
  toP.y = 0.0;
  float dl = length(toP);
  vec2 lean = toP.xz / (0.6 + dl * dl) * uPtrAmt * 0.28;
  q.xz -= lean * clamp(q.y / s.w + 0.6, 0.0, 1.8) * s.w;
  q.y *= SAG;
  return (length(q) - s.w) / SAG;
}

float map(vec3 p) {
  float d = 1e5;
  for (int i = 0; i < NS; i++) {
    if (uSph[i].w < 0.002) continue;
    d = smin(d, drop(p, i), uK);
  }
  // slow, heavy surface wobble
  float t = uTime;
  d += uWob * 0.022 * sin(3.1 * p.x + 1.7 * t) * sin(2.6 * p.y - 1.3 * t + 1.0) * sin(3.4 * p.z + 1.1 * t);
  // bulge toward the pointer
  vec3 dp = p - uPtr;
  d -= uPtrAmt * 0.16 * exp(-dot(dp, dp) * 2.4);
  // ripples
  for (int i = 0; i < 4; i++) {
    float age = uTime - uRip[i].w;
    if (age < 0.0 || age > 3.5) continue;
    float r = length(p - uRip[i].xyz);
    float front = age * 1.25;
    float env = exp(-age * 1.5) * exp(-(r - front) * (r - front) * 7.0);
    d += 0.05 * env * sin(15.0 * (r - front));
    d += 0.11 * exp(-age * 7.0) * exp(-r * r * 10.0);
  }
  return max(d, -p.y);
}

float ownership0(vec3 p) {
  if (uSph[0].w < 0.002) return 0.0;
  float d0 = drop(p, 0);
  float dm = 1e5;
  for (int i = 1; i < NS; i++) {
    if (uSph[i].w < 0.002) continue;
    dm = min(dm, drop(p, i));
  }
  return smoothstep(0.05, -0.05, d0 - dm);
}

vec3 calcN(vec3 p, float e) {
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) +
                   k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
}

float ao(vec3 p, vec3 n) {
  float occ = 0.0, s = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.05 * float(i);
    occ += (h - map(p + n * h)) * s;
    s *= 0.6;
  }
  return clamp(1.0 - 1.8 * occ, 0.0, 1.0);
}

void main() {
  vec3 ro;
  vec3 rd = camRay(gl_FragCoord.xy, ro);

  // bound the march with spheres around every droplet
  float t0 = 1e9, t1 = -1.0;
  for (int i = 0; i < NS; i++) {
    vec4 s = uSph[i];
    if (s.w < 0.002) continue;
    float R = s.w * 1.25 + uK * 0.55 + 0.28 + length(uVel[i].xyz) * 0.2 * s.w;
    vec3 oc = ro - s.xyz;
    float b = dot(oc, rd);
    float h = b * b - (dot(oc, oc) - R * R);
    if (h > 0.0) {
      h = sqrt(h);
      t0 = min(t0, -b - h);
      t1 = max(t1, -b + h);
    }
  }
  if (t1 < 0.0) { o = vec4(0.0); return; }

  float px = 2.0 * uTanH / uRes.y;
  float t = max(t0, 0.0);
  float best = 1e9, tb = t;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    float ratio = d / (px * t);
    if (ratio < best) { best = ratio; tb = t; }
    if (ratio < 0.4) { hit = true; break; }
    t += d * 0.78;
    if (t > t1) break;
  }
  float a = hit ? 1.0 : 1.0 - smoothstep(0.4, 1.4, best);
  if (a <= 0.001) { o = vec4(0.0); return; }

  float th = hit ? t : tb;
  vec3 p = ro + rd * th;
  vec3 n = calcN(p, 0.0006 * th + 0.0008);
  vec3 r = reflect(rd, n);
  float ct = clamp(dot(n, -rd), 0.0, 1.0);
  vec3 F0 = vec3(0.80, 0.79, 0.765);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - ct, 5.0);

  vec3 e = studio(p + n * 0.02, r, 0.0);

  // the first droplet reflects the SPL Token Launcher film, as if a screen stood behind the camera
  if (uVidMix > 0.001) {
    vec2 q;
    float m = panel(r, vec3(0.0, 0.1, 1.0), vec2(0.8, 0.45), 0.03, q);
    float w = m * ownership0(p) * uVidMix;
    if (w > 0.001) {
      vec2 vuv = vec2(0.5 + q.x / 1.6, 0.5 - q.y / 0.9);
      vec3 vc = texture(uVid, vuv).rgb;
      e = mix(e, vc * 0.92 + 0.04, w);
    }
  }

  float occ = ao(p, n);
  vec3 col = shoulder(e * F) * mix(0.55, 1.0, occ);
  col = clamp(col, 0.0, 1.0);
  o = vec4(col * a, a);
}
`;

export const FG_FRAG = /* glsl */ `#version 300 es
precision highp float;
${COMMON}
uniform float uSpin;
out vec4 o;
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  const float R = 0.74;
  float r = length(uv) / R;
  float a = 1.0 - smoothstep(0.6, 1.14, r);
  if (a <= 0.0) { o = vec4(0.0); return; }
  vec2 q = uv / R;
  q *= 1.0 / max(1.0, length(q) * 1.02);
  vec3 n = normalize(vec3(q, sqrt(max(1.0 - dot(q, q), 0.02))));
  vec3 rd = normalize(vec3(uv * 0.08, -1.0));
  vec3 rr = reflect(rd, n);
  float cs = cos(uSpin), sn = sin(uSpin);
  rr.xz = mat2(cs, -sn, sn, cs) * rr.xz;
  vec3 e = studio(vec3(0.0, 1.4, 3.0), rr, 1.7);
  float ct = clamp(n.z, 0.0, 1.0);
  vec3 F = vec3(0.8) + 0.2 * pow(1.0 - ct, 5.0);
  vec3 col = shoulder(e * F);
  col = mix(col, C_SEAM * 0.97, 0.3); // atmosphere between lens and droplet
  a *= 0.96;
  o = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`;
