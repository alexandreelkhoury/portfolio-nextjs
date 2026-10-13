/*
 * The margin figure: seven drawings, each resampled to exactly N line segments so
 * one can morph into the next segment by segment (the line count never changes).
 * Each shape is returned as a Float32Array of N * 6 floats (start xyz, end xyz),
 * fitted to a radius of about 1 and sorted by angle so neighbours travel together.
 */

export const N = 720;

type V = [number, number, number];
type Seg = [V, V];

const rotX = (p: V, a: number): V => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
const rotY = (p: V, a: number): V => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];

function poly(out: Seg[], pts: V[], closed = false) {
  for (let i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]);
  if (closed) out.push([pts[pts.length - 1], pts[0]]);
}

function box(out: Seg[], c: V, s: V) {
  const [x, y, z] = c;
  const [a, b, d] = [s[0] / 2, s[1] / 2, s[2] / 2];
  const v = (i: number, j: number, k: number): V => [x + i * a, y + j * b, z + k * d];
  for (const j of [-1, 1])
    for (const k of [-1, 1]) out.push([v(-1, j, k), v(1, j, k)]);
  for (const i of [-1, 1])
    for (const k of [-1, 1]) out.push([v(i, -1, k), v(i, 1, k)]);
  for (const i of [-1, 1])
    for (const j of [-1, 1]) out.push([v(i, j, -1), v(i, j, 1)]);
}

function dashed(out: Seg[], a: V, b: V, n: number) {
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 0.55) / n;
    out.push([lerp3(a, b, t0), lerp3(a, b, t1)]);
  }
}

const lerp3 = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* 0. Enneper surface of order two, as in the title page */
function enneper(): Seg[] {
  const out: Seg[] = [];
  const R = 1.32;
  const norm = 1 / (R + Math.pow(R, 5) / 5);
  const f = (r: number, t: number): V => {
    const r5 = Math.pow(r, 5) / 5;
    const p: V = [
      (r * Math.cos(t) - r5 * Math.cos(5 * t)) * norm,
      (-r * Math.sin(t) - r5 * Math.sin(5 * t)) * norm,
      ((2 / 3) * r * r * r * Math.cos(3 * t)) * norm,
    ];
    return rotX(p, -0.7);
  };
  for (let j = 2; j <= 6; j += 1) {
    const pts: V[] = [];
    for (let i = 0; i < 48; i++) pts.push(f((R * j) / 6, (i / 48) * Math.PI * 2));
    poly(out, pts, true);
  }
  for (let i = 0; i < 16; i++) {
    const pts: V[] = [];
    for (let q = 0; q <= 9; q++) pts.push(f((q / 9) * R, (i / 16) * Math.PI * 2));
    poly(out, pts);
  }
  return out;
}

/* 1. Merkle tree: 8 leaves, cubes for hashes, flat slips for the data under them */
function merkle(): Seg[] {
  const out: Seg[] = [];
  const L = 3;
  const x = (m: number, i: number) => (-1 + (2 * (i + 0.5)) / Math.pow(2, m)) * 1.05;
  const y = (m: number) => 0.85 - m * 0.48;
  for (let m = 0; m <= L; m++) {
    const n = Math.pow(2, m);
    const s = m === 0 ? 0.22 : 0.15;
    for (let i = 0; i < n; i++) {
      box(out, [x(m, i), y(m), 0], [s, s, s]);
      if (m < L) {
        for (const c of [2 * i, 2 * i + 1]) {
          const top: V = [x(m, i), y(m) - s / 2, 0];
          const mid = y(m) - 0.24;
          poly(out, [top, [x(m, i), mid, 0], [x(m + 1, c), mid, 0], [x(m + 1, c), y(m + 1) + 0.075, 0]]);
        }
      }
    }
  }
  for (let i = 0; i < 8; i++) {
    const cx = x(L, i);
    const yy = y(L) - 0.36;
    out.push([[cx, y(L) - 0.075, 0], [cx, yy + 0.09, 0]]);
    poly(out, [[cx - 0.08, yy + 0.09, 0], [cx + 0.08, yy + 0.09, 0], [cx + 0.08, yy - 0.09, 0], [cx - 0.08, yy - 0.09, 0]], true);
    out.push([[cx - 0.05, yy + 0.03, 0], [cx + 0.05, yy + 0.03, 0]]);
    out.push([[cx - 0.05, yy - 0.03, 0], [cx + 0.03, yy - 0.03, 0]]);
  }
  return out.map(([a, b]) => [rotX(a, -0.18), rotX(b, -0.18)] as Seg);
}

/* 2. The curve y^2 = x^3 - x + 1, a lattice of crosses, and P + Q = R drawn as chords */
function curve(): Seg[] {
  const out: Seg[] = [];
  const S = 0.42;
  const map = (x: number, y: number, z = 0): V => [(x - 0.3) * S, y * S * 0.78, z];
  const x0 = -1.3247;
  const up: V[] = [];
  const dn: V[] = [];
  for (let i = 0; i <= 56; i++) {
    const t = i / 56;
    const xx = x0 + (2.05 - x0) * t * t;
    const yy = Math.sqrt(Math.max(0, xx * xx * xx - xx + 1));
    up.push(map(xx, yy, 0.04));
    dn.push(map(xx, -yy, 0.04));
  }
  poly(out, up.reverse().concat(dn.slice(1)));
  for (let i = -2; i <= 3; i++)
    for (let j = -3; j <= 3; j++) {
      const c = map(i, j);
      const e = 0.035;
      out.push([[c[0] - e, c[1], 0], [c[0] + e, c[1], 0]]);
      out.push([[c[0], c[1] - e, 0], [c[0], c[1] + e, 0]]);
    }
  out.push([map(-2.4, 0), map(3.2, 0)]);
  out.push([map(0, -3.3), map(0, 3.3)]);
  dashed(out, map(-1.9, 1, 0.04), map(1.9, 1, 0.04), 14);
  dashed(out, map(1, 1, 0.04), map(1, -1, 0.04), 6);
  const dia = (x: number, y: number, r = 0.06) => {
    const c = map(x, y, 0.06);
    poly(out, [[c[0] - r, c[1], c[2]], [c[0], c[1] + r, c[2]], [c[0] + r, c[1], c[2]], [c[0], c[1] - r, c[2]]], true);
  };
  dia(-1, 1);
  dia(0, 1);
  dia(1, 1);
  dia(1, -1, 0.09);
  return out.map(([a, b]) => [rotX(a, -0.42), rotX(b, -0.42)] as Seg);
}

/* 3. Three chains at three depths, linked block to block, with dashed bridges */
function chains(): Seg[] {
  const out: Seg[] = [];
  const rows = [
    { y: 0.62, z: -0.5, off: -0.12 },
    { y: 0, z: 0, off: 0.1 },
    { y: -0.62, z: 0.5, off: -0.02 },
  ];
  const s = 0.24;
  const xs = (r: (typeof rows)[number], i: number) => -0.96 + i * 0.48 + r.off;
  rows.forEach((r) => {
    for (let i = 0; i < 5; i++) {
      box(out, [xs(r, i), r.y, r.z], [s, s, s]);
      if (i < 4) out.push([[xs(r, i) + s / 2, r.y, r.z], [xs(r, i + 1) - s / 2, r.y, r.z]]);
    }
  });
  const bridge = (a: number, ia: number, b: number, ib: number) => {
    const A = rows[a];
    const B = rows[b];
    dashed(out, [xs(A, ia), A.y - s / 2, A.z], [xs(B, ib), B.y + s / 2, B.z], 5);
  };
  bridge(0, 1, 1, 1);
  bridge(0, 3, 1, 4);
  bridge(1, 0, 2, 1);
  bridge(1, 3, 2, 3);
  return out.map(([a, b]) => [rotY(a, 0.42), rotY(b, 0.42)] as Seg);
}

/* 4. A laptop and a phone, the figures chapter in miniature */
function devices(): Seg[] {
  const out: Seg[] = [];
  // laptop base
  box(out, [-0.25, -0.5, 0.2], [1.5, 0.06, 0.95]);
  // lid, leaning back
  const lid: V[] = [
    [-1.0, -0.47, -0.27],
    [0.5, -0.47, -0.27],
    [0.5, 0.45, -0.45],
    [-1.0, 0.45, -0.45],
  ];
  poly(out, lid, true);
  const scr: V[] = [
    [-0.93, -0.38, -0.29],
    [0.43, -0.38, -0.29],
    [0.43, 0.39, -0.44],
    [-0.93, 0.39, -0.44],
  ];
  poly(out, scr, true);
  for (let r = 0; r < 4; r++) {
    const z = -0.12 + r * 0.12;
    out.push([[-0.88, -0.465, z], [0.38, -0.465, z]]);
  }
  poly(out, [[-0.45, -0.465, 0.42], [-0.05, -0.465, 0.42], [-0.05, -0.465, 0.6], [-0.45, -0.465, 0.6]], true);
  // phone, standing in front
  box(out, [0.85, -0.12, 0.45], [0.42, 0.82, 0.05]);
  poly(out, [[0.68, -0.48, 0.48], [1.02, -0.48, 0.48], [1.02, 0.22, 0.48], [0.68, 0.22, 0.48]], true);
  out.push([[0.8, 0.25, 0.48], [0.9, 0.25, 0.48]]);
  return out.map(([a, b]) => [rotX(rotY(a, -0.35), 0.18), rotX(rotY(b, -0.35), 0.18)] as Seg);
}

/* 5. Network of everything: nodes on a sphere, nearest neighbours joined, three great circles */
function network(): Seg[] {
  const out: Seg[] = [];
  const P: V[] = [];
  const n = 38;
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const t = i * 2.39996;
    P.push([Math.cos(t) * r * 0.95, y * 0.95, Math.sin(t) * r * 0.95]);
  }
  const seen = new Set<string>();
  P.forEach((p, i) => {
    const d = P.map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) })).sort((a, b) => a.d - b.d);
    for (const { j } of d.slice(1, 4)) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push([p, P[j]]);
      }
    }
    const e = 0.03;
    out.push([[p[0] - e, p[1], p[2]], [p[0] + e, p[1], p[2]]]);
    out.push([[p[0], p[1] - e, p[2]], [p[0], p[1] + e, p[2]]]);
  });
  for (const tilt of [0, 1.1, -1.1]) {
    const pts: V[] = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 2;
      pts.push(rotX([Math.cos(t) * 0.62, 0, Math.sin(t) * 0.62], tilt));
    }
    poly(out, pts, true);
  }
  // the hub at the centre, spoked to six nodes
  box(out, [0, 0, 0], [0.16, 0.16, 0.16]);
  for (const k of [3, 9, 16, 22, 29, 35]) dashed(out, [0, 0, 0], P[k], 4);
  return out;
}

/* 6. The tombstone: a slab, its front face hatched solid */
function qed(): Seg[] {
  const out: Seg[] = [];
  const w = 1.15;
  const d = 0.28;
  box(out, [0, 0, 0], [w, w, d]);
  for (let i = 1; i < 56; i++) {
    const y = -w / 2 + (w * i) / 56;
    out.push([[-w / 2, y, d / 2], [w / 2, y, d / 2]]);
  }
  for (let i = 1; i < 10; i++) {
    const z = -d / 2 + (d * i) / 10;
    out.push([[-w / 2, w / 2, z], [w / 2, w / 2, z]]);
  }
  return out.map(([a, b]) => [rotX(rotY(a, -0.5), 0.32), rotX(rotY(b, -0.5), 0.32)] as Seg);
}

function finish(segs: Seg[]): Float32Array {
  // fit to radius 1
  let max = 0;
  for (const s of segs) for (const p of s) max = Math.max(max, Math.hypot(p[0], p[1], p[2]));
  const k = 1 / max;
  let list = segs.map(([a, b]) => [a.map((v) => v * k), b.map((v) => v * k)] as Seg);
  if (list.length > N) list = list.slice(0, N);
  // subdivide the longest segment until the count is exactly N
  while (list.length < N) {
    let bi = 0;
    let bl = -1;
    for (let i = 0; i < list.length; i++) {
      const [a, b] = list[i];
      const l = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (l > bl) {
        bl = l;
        bi = i;
      }
    }
    const [a, b] = list[bi];
    const m = lerp3(a, b, 0.5);
    list.splice(bi, 1, [a, m], [m, b]);
  }
  list.sort((s1, s2) => {
    const k1 = Math.atan2(s1[0][1] + s1[1][1], s1[0][0] + s1[1][0]);
    const k2 = Math.atan2(s2[0][1] + s2[1][1], s2[0][0] + s2[1][0]);
    return k1 - k2;
  });
  const out = new Float32Array(N * 6);
  list.forEach(([a, b], i) => out.set([...a, ...b], i * 6));
  return out;
}

let cache: Float32Array[] | null = null;
export function getShapes(): Float32Array[] {
  if (!cache) cache = [enneper(), merkle(), curve(), chains(), devices(), network(), qed()].map(finish);
  return cache;
}
