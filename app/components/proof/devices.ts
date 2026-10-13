import * as THREE from 'three';

/*
 * Ink-line device frames for chapter IV. Each device is a set of line segments
 * (flat xyz pairs) plus paper-coloured fill meshes that hide the lines behind them,
 * the way a technical drawing removes hidden lines, and one screen plane that
 * carries the video or screenshot. The laptop's lid is a separate part so it can
 * open on its hinge as the plate scrolls in.
 */

export type DeviceKind = 'laptop' | 'tablet' | 'monitor';

export type Part = {
  lines: number[];
  detail: number[];
  fills: THREE.BufferGeometry[];
  screen?: { geo: THREE.BufferGeometry; w: number; h: number };
};

export type Device = {
  kind: DeviceKind;
  base: Part;
  /** laptop only: the lid, built in hinge space (hinge on the x axis at the origin) */
  lid?: Part;
  hinge?: THREE.Vector3;
  /** vertical centre of the drawing, for framing */
  centerY: number;
  floorY: number;
  width: number;
};

const emptyPart = (): Part => ({ lines: [], detail: [], fills: [] });

function seg(out: number[], a: THREE.Vector3, b: THREE.Vector3) {
  out.push(a.x, a.y, a.z, b.x, b.y, b.z);
}

function loop(out: number[], pts: THREE.Vector3[]) {
  for (let i = 0; i < pts.length; i++) seg(out, pts[i], pts[(i + 1) % pts.length]);
}

/** 12 edges of a box, transformed by m */
function boxEdges(out: number[], size: [number, number, number], m: THREE.Matrix4) {
  const [a, b, c] = size.map((v) => v / 2);
  const v = (i: number, j: number, k: number) => new THREE.Vector3(i * a, j * b, k * c).applyMatrix4(m);
  for (const j of [-1, 1]) for (const k of [-1, 1]) seg(out, v(-1, j, k), v(1, j, k));
  for (const i of [-1, 1]) for (const k of [-1, 1]) seg(out, v(i, -1, k), v(i, 1, k));
  for (const i of [-1, 1]) for (const j of [-1, 1]) seg(out, v(i, j, -1), v(i, j, 1));
}

function boxFill(size: [number, number, number], m: THREE.Matrix4) {
  const g = new THREE.BoxGeometry(...size);
  g.applyMatrix4(m);
  return g;
}

function roundRect(w: number, h: number, r: number, z: number, m: THREE.Matrix4, steps = 6) {
  const pts: THREE.Vector3[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z).applyMatrix4(m));
    }
  return pts;
}

function roundSlabFill(w: number, h: number, r: number, d: number, m: THREE.Matrix4) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2 + r, -h / 2);
  sh.lineTo(w / 2 - r, -h / 2);
  sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  sh.lineTo(w / 2, h / 2 - r);
  sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  sh.lineTo(-w / 2 + r, h / 2);
  sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  sh.lineTo(-w / 2, -h / 2 + r);
  sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -d / 2);
  g.applyMatrix4(m);
  return g;
}

function screenPlane(w: number, h: number, m: THREE.Matrix4) {
  const g = new THREE.PlaneGeometry(w, h);
  g.applyMatrix4(m);
  return g;
}

/** engraver's cast shadow: parallel hatch lines clipped to an ellipse on the floor */
function hatchShadow(out: number[], rx: number, rz: number, y: number, cz = 0, n = 16) {
  for (let i = 1; i < n; i++) {
    const z = -rz + (2 * rz * i) / n;
    const half = rx * Math.sqrt(1 - (z / rz) ** 2) * (0.75 + 0.25 * Math.sin(i * 1.7));
    seg(out, new THREE.Vector3(-half, y, z + cz), new THREE.Vector3(half * 0.92, y, z + cz));
  }
}

const M = () => new THREE.Matrix4();

function laptop(): Device {
  const W = 3.4;
  const D = 2.25;
  const T = 0.1;
  const base = emptyPart();
  const mBase = M().makeTranslation(0, T / 2, 0);
  boxEdges(base.lines, [W, T, D], mBase);
  base.fills.push(boxFill([W, T, D], mBase));
  // keyboard: rows of key caps drawn as small rectangles on the deck
  const deckY = T + 0.001;
  const rows = 5;
  const cols = 13;
  const kw = 2.86 / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c > 3 && c < 9) continue;
      const x = -1.43 + c * kw + kw * 0.12;
      const z = -0.98 + r * 0.19;
      loop(base.detail, [
        new THREE.Vector3(x, deckY, z),
        new THREE.Vector3(x + kw * 0.76, deckY, z),
        new THREE.Vector3(x + kw * 0.76, deckY, z + 0.14),
        new THREE.Vector3(x, deckY, z + 0.14),
      ]);
    }
  }
  // space bar
  loop(base.detail, [
    new THREE.Vector3(-1.43 + 4 * kw, deckY, -0.98 + 4 * 0.19),
    new THREE.Vector3(-1.43 + 9 * kw - kw * 0.12, deckY, -0.98 + 4 * 0.19),
    new THREE.Vector3(-1.43 + 9 * kw - kw * 0.12, deckY, -0.98 + 4 * 0.19 + 0.14),
    new THREE.Vector3(-1.43 + 4 * kw, deckY, -0.98 + 4 * 0.19 + 0.14),
  ]);
  // trackpad
  loop(base.lines, [
    new THREE.Vector3(-0.62, deckY, 0.12),
    new THREE.Vector3(0.62, deckY, 0.12),
    new THREE.Vector3(0.62, deckY, 0.95),
    new THREE.Vector3(-0.62, deckY, 0.95),
  ]);
  hatchShadow(base.detail, 2.1, 1.35, -0.02, 0.1);

  // lid in hinge space: x across, y up the lid, z out of the screen
  const lid = emptyPart();
  const sw = 3.14;
  const sh = sw / (16 / 9);
  const LH = sh + 0.12 + 0.2;
  const LT = 0.07;
  const mLid = M().makeTranslation(0, LH / 2, LT / 2);
  boxEdges(lid.lines, [W, LH, LT], mLid);
  lid.fills.push(boxFill([W, LH, LT], mLid));
  const mScr = M().makeTranslation(0, 0.2 + sh / 2, LT + 0.003);
  lid.screen = { geo: screenPlane(sw, sh, mScr), w: sw, h: sh };
  const z = LT + 0.004;
  loop(lid.lines, [
    new THREE.Vector3(-sw / 2, 0.2, z),
    new THREE.Vector3(sw / 2, 0.2, z),
    new THREE.Vector3(sw / 2, 0.2 + sh, z),
    new THREE.Vector3(-sw / 2, 0.2 + sh, z),
  ]);
  // camera dot
  const cam: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cam.push(new THREE.Vector3(Math.cos(a) * 0.025, LH - 0.06 + Math.sin(a) * 0.025, z));
  }
  loop(lid.detail, cam);
  return { kind: 'laptop', base, lid, hinge: new THREE.Vector3(0, T, -D / 2 + 0.02), centerY: 1.0, floorY: 0, width: W };
}

function tablet(): Device {
  const sw = 3.0;
  const sh = sw / (16 / 9);
  const W = sw + 0.32;
  const H = sh + 0.32;
  const Dp = 0.09;
  const r = 0.2;
  const p = emptyPart();
  const m = M();
  const front = roundRect(W, H, r, Dp / 2, m);
  const back = roundRect(W, H, r, -Dp / 2, m);
  loop(p.lines, front);
  loop(p.lines, back);
  for (const i of [0, 7, 14, 21, 6, 13, 20, 27]) seg(p.lines, front[i], back[i]);
  p.fills.push(roundSlabFill(W, H, r, Dp, m));
  loop(p.lines, roundRect(sw, sh, 0.05, Dp / 2 + 0.004, m, 3));
  p.screen = { geo: screenPlane(sw, sh, M().makeTranslation(0, 0, Dp / 2 + 0.003)), w: sw, h: sh };
  const cam: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cam.push(new THREE.Vector3(Math.cos(a) * 0.03, H / 2 - 0.08 + Math.sin(a) * 0.03, Dp / 2 + 0.004));
  }
  loop(p.detail, cam);
  hatchShadow(p.detail, 1.9, 0.7, -H / 2 - 0.55, 0.2, 12);
  return { kind: 'tablet', base: p, centerY: 0, floorY: -H / 2 - 0.55, width: W };
}

function monitor(): Device {
  const sw = 3.5;
  const sh = sw / (16 / 9);
  const W = sw + 0.14;
  const H = sh + 0.1 + 0.24;
  const T = 0.07;
  const cy = 1.55;
  const p = emptyPart();
  const mPanel = M().makeTranslation(0, cy, 0);
  boxEdges(p.lines, [W, H, T], mPanel);
  p.fills.push(boxFill([W, H, T], mPanel));
  const sy = cy - H / 2 + 0.24 + sh / 2;
  p.screen = { geo: screenPlane(sw, sh, M().makeTranslation(0, sy, T / 2 + 0.003)), w: sw, h: sh };
  loop(p.lines, [
    new THREE.Vector3(-sw / 2, sy - sh / 2, T / 2 + 0.004),
    new THREE.Vector3(sw / 2, sy - sh / 2, T / 2 + 0.004),
    new THREE.Vector3(sw / 2, sy + sh / 2, T / 2 + 0.004),
    new THREE.Vector3(-sw / 2, sy + sh / 2, T / 2 + 0.004),
  ]);
  // back housing
  const mBack = M().makeTranslation(0, cy - 0.1, -T / 2 - 0.09);
  boxEdges(p.detail, [2.2, 1.3, 0.18], mBack);
  p.fills.push(boxFill([2.2, 1.3, 0.18], mBack));
  // neck and foot
  const mNeck = M().makeRotationX(-0.1).premultiply(M().makeTranslation(0, 0.42, -0.32));
  boxEdges(p.lines, [0.34, 0.95, 0.07], mNeck);
  p.fills.push(boxFill([0.34, 0.95, 0.07], mNeck));
  const foot = roundRect(1.5, 0.95, 0.3, 0, M().makeRotationX(-Math.PI / 2).premultiply(M().makeTranslation(0, 0.02, -0.2)));
  loop(p.lines, foot);
  hatchShadow(p.detail, 1.8, 0.75, 0, -0.15, 12);
  return { kind: 'monitor', base: p, centerY: 1.35, floorY: 0, width: W };
}

export function buildDevice(kind: DeviceKind): Device {
  if (kind === 'laptop') return laptop();
  if (kind === 'tablet') return tablet();
  return monitor();
}
