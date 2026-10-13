// Scene model for the Liquidity hero: camera, droplet choreography, springs, projection.
// The same camera math is used in the shaders, so HTML labels sit exactly on the droplets.

export type V3 = [number, number, number];
export type Cam = { pos: V3; tgt: V3; fov: number };
export type Drop = [number, number, number]; // x, z, radius (sits on the floor y = 0)

export type Layout = {
  name: 'desktop' | 'mobile';
  cam0: Cam;
  cam1: Cam;
  pool: Drop[]; // 7 entries: 5 project droplets + 2 satellites
  final: Drop[]; // 5 entries, project droplets only
  hosts: [number, number]; // which droplets absorb the two satellites
};

export const SAG = 1.22; // vertical squash of each droplet: half height = r / SAG

const desktop: Layout = {
  name: 'desktop',
  cam0: { pos: [0, 1.45, 9.6], tgt: [0, 0.78, 0], fov: 26 },
  cam1: { pos: [0, 3.3, 10.2], tgt: [0, 0.55, 0], fov: 27 },
  pool: [
    [-0.2, 0.05, 0.62],
    [0.5, -0.25, 0.78],
    [1.0, 0.3, 0.66],
    [1.55, -0.05, 0.55],
    [0.3, 0.45, 0.5],
    [-1.55, 0.95, 0.15],
    [2.6, 0.7, 0.11],
  ],
  final: [
    [-3.0, 0.25, 0.66],
    [-1.5, -0.45, 0.5],
    [0.0, 0.35, 0.55],
    [1.5, -0.4, 0.46],
    [3.0, 0.2, 0.52],
  ],
  hosts: [0, 3],
};

const mobile: Layout = {
  name: 'mobile',
  cam0: { pos: [0, 1.6, 9.6], tgt: [0, 0.5, 0], fov: 36 },
  cam1: { pos: [0, 13, 8.5], tgt: [0, 0, -0.8], fov: 33 },
  pool: [
    [-0.5, 0.0, 0.37],
    [-0.08, -0.3, 0.45],
    [0.28, 0.25, 0.38],
    [0.58, -0.1, 0.31],
    [-0.04, 0.45, 0.31],
    [-1.1, 1.0, 0.1],
    [1.1, 0.85, 0.085],
  ],
  final: [
    [-0.8, -2.45, 0.6],
    [0.8, -1.12, 0.5],
    [-0.8, 0.2, 0.54],
    [0.8, 1.52, 0.48],
    [-0.8, 2.8, 0.5],
  ],
  hosts: [1, 3],
};

export const pickLayout = (w: number, h: number): Layout => (w < 760 || w / h < 0.8 ? mobile : desktop);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function cameraAt(L: Layout, p: number): Cam {
  const e = easeInOut(smooth(0.1, 0.72, p));
  return {
    pos: [0, 1, 2].map((i) => lerp(L.cam0.pos[i], L.cam1.pos[i], e)) as V3,
    tgt: [0, 1, 2].map((i) => lerp(L.cam0.tgt[i], L.cam1.tgt[i], e)) as V3,
    fov: lerp(L.cam0.fov, L.cam1.fov, e),
  };
}

// Smooth-union radius: high while it is one pool, low once the droplets are free.
export const blendK = (p: number) => lerp(0.78, 0.16, smooth(0.34, 0.58, p));
// Ambient wobble: idle breathing, stronger while the pool stretches and splits.
export const wobbleAt = (p: number) => 0.55 + 1.1 * smooth(0.12, 0.32, p) * (1 - smooth(0.5, 0.8, p));

// Target state for each of the 7 spheres at progress p and time t.
export function targets(L: Layout, p: number, t: number) {
  const stretch = smooth(0.1, 0.34, p);
  const split = smooth(0.34, 0.6, p);
  const travel = 0.3 * stretch + 0.7 * split;
  const out: { pos: V3; r: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const a = L.pool[i];
    const b = L.final[i];
    // during the stretch the pool elongates along the final line but stays merged
    const x = lerp(a[0], b[0], travel);
    const z = lerp(a[1], b[1], travel);
    const r = lerp(a[2], b[2], split) * (1 - 0.12 * stretch * (1 - split));
    const breathe = 0.035 * (1 + stretch * (1 - split) * 2.5);
    out.push({
      pos: [
        x + breathe * Math.sin(t * 1.3 + i * 2.1),
        r / SAG,
        z + breathe * Math.cos(t * 1.1 + i * 1.7),
      ],
      r: r * (1 + 0.02 * Math.sin(t * 1.7 + i)),
    });
  }
  for (let j = 0; j < 2; j++) {
    const s = L.pool[5 + j];
    const host = out[L.hosts[j]];
    const absorb = smooth(0.03, 0.2, p);
    const r = s[2] * (1 - 0.25 * absorb) * (1 - smooth(0.46, 0.62, p));
    const hx = host.pos[0] + (j ? 0.25 : -0.25) * host.r;
    const hz = host.pos[2] + 0.2 * host.r;
    out.push({
      pos: [
        lerp(s[0], hx, absorb) + 0.02 * Math.sin(t * 2 + j),
        Math.max(r, 0.001) / SAG,
        lerp(s[1], hz, absorb),
      ],
      r,
    });
  }
  return out;
}

// Camera basis + projection identical to the shader.
export function basis(c: Cam) {
  const fw = norm(sub(c.tgt, c.pos));
  const rt = norm(cross(fw, [0, 1, 0]));
  const up = cross(rt, fw);
  return { fw, rt, up, tanH: Math.tan((c.fov * Math.PI) / 360) };
}

export function project(c: Cam, p: V3, w: number, h: number): [number, number, number] {
  const B = basis(c);
  const d = sub(p, c.pos);
  const z = dot(d, B.fw);
  const x = dot(d, B.rt) / (z * B.tanH);
  const y = dot(d, B.up) / (z * B.tanH);
  // uv.y in [-1, 1] spans the height; uv.x is scaled by aspect
  return [w / 2 + (x * h) / 2, h / 2 - (y * h) / 2, z];
}

export function rayFrom(c: Cam, sx: number, sy: number, w: number, h: number): { o: V3; d: V3 } {
  const B = basis(c);
  const ux = (2 * sx - w) / h;
  const uy = (h - 2 * sy) / h;
  const d = norm([
    B.fw[0] + B.tanH * (ux * B.rt[0] + uy * B.up[0]),
    B.fw[1] + B.tanH * (ux * B.rt[1] + uy * B.up[1]),
    B.fw[2] + B.tanH * (ux * B.rt[2] + uy * B.up[2]),
  ]);
  return { o: c.pos, d };
}

export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
