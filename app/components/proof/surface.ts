import * as THREE from 'three';

/*
 * Proof: an Enneper minimal surface of order 2, drawn only as ink lines.
 *
 *   x1 = Re(z - z^5/5),  x2 = Re(i(z + z^5/5)),  x3 = Re(2z^3/3),  z = r e^{i theta}
 *
 * Every vertex also carries a lattice target (a rectilinear binary Merkle tree on a
 * ruled grid) so the same lines can straighten and settle. The surface is split by
 * view depth into two canvases: the back half renders under the HTML title, the front
 * half (with a paper-coloured halo, as in an engraving) renders over it.
 */

export type SceneState = { draw: number; morph: number; nodes: number; lift: number };

type Opts = {
  reduce: boolean;
  getState: () => SceneState;
  onReady?: () => void;
  onLayout?: (root: { x: number; y: number }) => void;
};

const PAPER = new THREE.Color('#f2ede3');
const INK = new THREE.Color('#17150f');
const VERM = new THREE.Color('#b0361a');

const R = 1.32; // parameter radius
const NORM = 1 / (R + Math.pow(R, 5) / 5); // planar radius -> 1
const NR = 10; // iso-r rings
const NS = 240; // samples per ring
const NT = 64; // iso-theta radials
const NSR = 72; // samples per radial
const LEVELS = 5; // tree depth: 32 leaves -> 1 root
const TILT = -1.02;
const CAM_Z = 10;
const FOV = 30;
const VIS_H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);

function enneper(r: number, t: number): [number, number, number] {
  const r5 = Math.pow(r, 5) / 5;
  return [
    (r * Math.cos(t) - r5 * Math.cos(5 * t)) * NORM,
    (-r * Math.sin(t) - r5 * Math.sin(5 * t)) * NORM,
    ((2 / 3) * r * r * r * Math.cos(3 * t)) * NORM,
  ];
}

function nodeX(level: number, idx: number) {
  return -0.5 + (idx + 0.5) / Math.pow(2, level);
}
function levelY(level: number) {
  return 0.5 - level / LEVELS;
}

/** Rectilinear path from the root (top) down to leaf k, in normalised lattice space. */
function treePath(k: number): [number, number][] {
  const pts: [number, number][] = [[nodeX(0, 0), levelY(0)]];
  for (let m = 0; m < LEVELS; m++) {
    const x0 = nodeX(m, k >> (LEVELS - m));
    const x1 = nodeX(m + 1, k >> (LEVELS - m - 1));
    const mid = levelY(m) - 0.5 / LEVELS;
    pts.push([x0, mid], [x1, mid], [x1, levelY(m + 1)]);
  }
  return pts;
}

function samplePath(pts: [number, number][], s: number): [number, number] {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = s * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] === 0 ? 0 : Math.min(1, d / lens[i]);
      return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f,
      ];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}

function buildLines() {
  const pos: number[] = [];
  const lat: number[] = [];
  const gate: number[] = [];
  const kind: number[] = [];

  const pushPolyline = (
    P: [number, number, number][],
    L: [number, number][],
    G: number[],
    k: number,
  ) => {
    for (let i = 0; i < P.length - 1; i++) {
      for (const j of [i, i + 1]) {
        pos.push(...P[j]);
        lat.push(L[j][0], L[j][1], 0);
        gate.push(G[j]);
        kind.push(k);
      }
    }
  };

  // rings: drawn just after the radial front reaches their radius
  for (let j = 0; j < NR; j++) {
    const r = (R * (j + 1)) / NR;
    const P: [number, number, number][] = [];
    const L: [number, number][] = [];
    const G: number[] = [];
    for (let i = 0; i <= NS; i++) {
      const f = i / NS;
      P.push(enneper(r, f * Math.PI * 2));
      L.push([-0.5 + f, 0.5 - (j + 1) / NR]);
      G.push((j + 1) / NR + 0.25 * f);
    }
    pushPolyline(P, L, G, 0);
  }

  // radials: grow from the centre, which becomes the root of the tree
  for (let i = 0; i < NT; i++) {
    const t = (i / NT) * Math.PI * 2;
    const path = treePath(i >> 1);
    const P: [number, number, number][] = [];
    const L: [number, number][] = [];
    const G: number[] = [];
    for (let q = 0; q <= NSR; q++) {
      const s = q / NSR;
      P.push(enneper(s * R, t));
      L.push(samplePath(path, s));
      G.push(s);
    }
    pushPolyline(P, L, G, 1);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aLat', new THREE.Float32BufferAttribute(lat, 3));
  g.setAttribute('aGate', new THREE.Float32BufferAttribute(gate, 1));
  g.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));
  return g;
}

function buildNodes() {
  const fillP: number[] = [];
  const fillC: number[] = [];
  const lineP: number[] = [];
  const lineC: number[] = [];
  const rootP: number[] = [];
  const rootC: number[] = [];
  const quad = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1];
  const edges = [-1, -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1];
  for (let m = 0; m <= LEVELS; m++) {
    for (let idx = 0; idx < Math.pow(2, m); idx++) {
      const x = nodeX(m, idx);
      const y = levelY(m);
      if (m === 0) {
        for (let i = 0; i < 6; i++) {
          rootP.push(x, y, 0);
          rootC.push(quad[i * 2], quad[i * 2 + 1]);
        }
        continue;
      }
      for (let i = 0; i < 6; i++) {
        fillP.push(x, y, 0);
        fillC.push(quad[i * 2], quad[i * 2 + 1]);
      }
      for (let i = 0; i < 8; i++) {
        lineP.push(x, y, 0);
        lineC.push(edges[i * 2], edges[i * 2 + 1]);
      }
    }
  }
  const mk = (p: number[], c: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('aCorner', new THREE.Float32BufferAttribute(c, 2));
    return g;
  };
  return { fill: mk(fillP, fillC), line: mk(lineP, lineC), root: mk(rootP, rootC) };
}

const lineVert = /* glsl */ `
uniform mat4 uModel;
uniform float uMorph;
uniform vec3 uLat;
uniform vec2 uOffset;
attribute vec3 aLat;
attribute float aGate;
attribute float aKind;
varying float vGate;
varying float vZ;
varying float vM;
varying float vKind;
void main() {
  vec4 sw = uModel * vec4(position, 1.0);
  float m = clamp(uMorph * 1.45 - aGate * 0.36, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 lw = vec3(aLat.x * uLat.x, aLat.y * uLat.y + uLat.z, -0.05);
  vec3 w = mix(sw.xyz, lw, m);
  vec4 mv = viewMatrix * vec4(w, 1.0);
  vZ = mv.z;
  vGate = aGate;
  vM = m;
  vKind = aKind;
  vec4 p = projectionMatrix * mv;
  p.xy += uOffset * p.w;
  gl_Position = p;
}
`;

const lineFrag = /* glsl */ `
uniform float uU;
uniform float uSide;
uniform float uCz;
uniform float uHalo;
uniform float uAlpha;
uniform vec3 uColor;
varying float vGate;
varying float vZ;
varying float vM;
varying float vKind;
void main() {
  if (vGate > uU) discard;
  float front = vZ - uCz;
  if (uSide > 0.5) { if (front <= 0.0) discard; }
  else { if (front > 0.0) discard; }
  float near = clamp(front / 2.0 * 0.5 + 0.5, 0.0, 1.0);
  float a = mix(0.22, 0.95, near);
  a = mix(a, vKind > 0.5 ? 0.8 : 0.26, vM);
  a *= mix(0.35, 1.0, smoothstep(0.0, 0.04, uU - vGate));
  if (uHalo > 0.5) a = 1.0;
  gl_FragColor = vec4(uColor, a * uAlpha);
}
`;

const nodeVert = /* glsl */ `
uniform vec3 uLat;
uniform float uHalf;
attribute vec2 aCorner;
void main() {
  vec3 w = vec3(position.x * uLat.x + aCorner.x * uHalf, position.y * uLat.y + uLat.z + aCorner.y * uHalf, -0.04);
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;
const nodeFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha); }
`;

export function createSurfaceScene(back: HTMLCanvasElement, front: HTMLCanvasElement, opts: Opts) {
  const mkRenderer = (canvas: HTMLCanvasElement) => {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    r.setClearColor(0x000000, 0);
    return r;
  };
  const rB = mkRenderer(back);
  const rF = mkRenderer(front);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  const common = {
    uModel: { value: new THREE.Matrix4() },
    uU: { value: 0 },
    uMorph: { value: 0 },
    uLat: { value: new THREE.Vector3(5, 2.2, 0.8) },
    uCz: { value: -CAM_Z },
  };

  const lineGeo = buildLines();
  const nodeGeo = buildNodes();
  const disposables: { dispose: () => void }[] = [lineGeo, nodeGeo.fill, nodeGeo.line, nodeGeo.root];

  const lineMat = (side: number, color: THREE.Color, halo: number, offset = new THREE.Vector2()) => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        ...common,
        uSide: { value: side },
        uColor: { value: color },
        uHalo: { value: halo },
        uOffset: { value: offset },
        uAlpha: { value: 1 },
      },
      vertexShader: lineVert,
      fragmentShader: lineFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    disposables.push(m);
    return m;
  };

  const nodeUniforms = { uLat: common.uLat, uHalf: { value: 0.04 } };
  const rootUniforms = { uLat: common.uLat, uHalf: { value: 0.07 } };
  const nodeMat = (color: THREE.Color, u: typeof nodeUniforms) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { ...u, uColor: { value: color }, uAlpha: { value: 0 } },
      vertexShader: nodeVert,
      fragmentShader: nodeFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    disposables.push(m);
    return m;
  };

  const add = (scene: THREE.Scene, obj: THREE.Object3D, order: number) => {
    obj.frustumCulled = false;
    obj.renderOrder = order;
    scene.add(obj);
  };

  // back scene: far half of the surface, then the tree nodes
  const sceneB = new THREE.Scene();
  add(sceneB, new THREE.LineSegments(lineGeo, lineMat(0, INK, 0)), 0);
  const fillMat = nodeMat(PAPER, nodeUniforms);
  const outlineMat = nodeMat(INK, nodeUniforms);
  const rootMat = nodeMat(VERM, rootUniforms);
  add(sceneB, new THREE.Mesh(nodeGeo.fill, fillMat), 1);
  add(sceneB, new THREE.LineSegments(nodeGeo.line, outlineMat), 2);
  add(sceneB, new THREE.Mesh(nodeGeo.root, rootMat), 3);

  // front scene: paper halos (engraver's gap), then the near half in ink
  const sceneF = new THREE.Scene();
  const haloOffsets = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
  const haloDirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  haloOffsets.forEach((o, i) => add(sceneF, new THREE.LineSegments(lineGeo, lineMat(1, PAPER, 1, o)), i));
  add(sceneF, new THREE.LineSegments(lineGeo, lineMat(1, INK, 0)), 10);

  // layout
  let surfScale = 1.6;
  let surfY = 0.3;
  const resize = () => {
    const w = back.clientWidth || window.innerWidth;
    const h = back.clientHeight || window.innerHeight;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    for (const r of [rB, rF]) {
      r.setPixelRatio(dpr);
      r.setSize(w, h, false);
    }
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const visW = VIS_H * aspect;
    const portrait = aspect < 0.85;
    if (portrait) {
      surfScale = Math.min(1.3, visW * 0.5);
      surfY = 0.62;
      common.uLat.value.set(visW * 0.84, 2.1, 0.78);
    } else {
      surfScale = Math.min(1.9, VIS_H * 0.355, visW * 0.26);
      surfY = 0.3;
      common.uLat.value.set(Math.min(5.8, visW * 0.6), 2.25, 0.82);
    }
    const lat = common.uLat.value;
    nodeUniforms.uHalf.value = Math.min(0.05, (lat.x / 32) * 0.26);
    rootUniforms.uHalf.value = nodeUniforms.uHalf.value * 1.7;
    const halo = 1.5;
    haloOffsets.forEach((o, i) => o.set((haloDirs[i][0] * 2 * halo) / w, (haloDirs[i][1] * 2 * halo) / h));
    const rootY = lat.z + lat.y * 0.5;
    opts.onLayout?.({ x: w / 2, y: h / 2 - (rootY / VIS_H) * h });
    if (opts.reduce || !running) tick(0);
  };

  // pointer: a few degrees toward the cursor
  const ptr = { tx: 0, ty: 0, x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    ptr.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ptr.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  if (!opts.reduce) window.addEventListener('pointermove', onPointer, { passive: true });

  const q = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  let spin = 0.55;
  let readyFired = false;

  function tick(dt: number) {
    const s = opts.getState();
    spin += dt * 0.06 * (1 - s.morph);
    const k = Math.min(1, dt * 2.5);
    ptr.x += (ptr.tx - ptr.x) * k;
    ptr.y += (ptr.ty - ptr.y) * k;
    eul.set(TILT + ptr.y * 0.055, ptr.x * 0.075, spin, 'YXZ');
    q.setFromEuler(eul);
    pos.set(0, surfY + s.lift, 0);
    scl.setScalar(surfScale);
    common.uModel.value.compose(pos, q, scl);
    common.uCz.value = -CAM_Z;
    common.uU.value = s.draw >= 0.999 ? 2 : s.draw * 1.25;
    common.uMorph.value = s.morph;
    fillMat.uniforms.uAlpha.value = s.nodes;
    outlineMat.uniforms.uAlpha.value = s.nodes * 0.85;
    rootMat.uniforms.uAlpha.value = s.nodes;
    rB.render(sceneB, camera);
    rF.render(sceneF, camera);
    if (!readyFired) {
      readyFired = true;
      opts.onReady?.();
    }
  }

  let raf = 0;
  let running = false;
  let last = 0;
  const frame = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(dt);
  };

  const start = () => {
    if (opts.reduce) {
      tick(0);
      return;
    }
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  resize();

  return {
    start,
    stop,
    resize,
    render: () => tick(0),
    dispose() {
      stop();
      window.removeEventListener('pointermove', onPointer);
      disposables.forEach((d) => d.dispose());
      for (const r of [rB, rF]) {
        r.dispose();
        r.forceContextLoss();
      }
    },
  };
}
