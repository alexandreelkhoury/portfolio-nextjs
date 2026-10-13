'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { getShapes, N } from './figureShapes';
import { FIGURE_CAPTIONS } from './content';
import s from './site.module.css';

/*
 * The figure that keeps proving itself. One drawing of N ink segments lives in the
 * margin for the whole page. Elements marked data-fig="k" are anchors: as the next
 * anchor rises toward the reading line, every segment travels from shape i to
 * shape j, so the drawing re-forms instead of crossfading.
 * Desktop: fixed in the right margin, scrubbed by scroll.
 * Narrow screens: shown only while a chapter intertitle (data-inter) is on screen.
 */

const INK = new THREE.Color('#17150f');
const PAPER = new THREE.Color('#efe9dd');
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

export default function MarginFigure() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrowMq = window.matchMedia('(max-width: 1099px)');
    const shapes = getShapes();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 4.05);

    const P = new Float32Array(shapes[0]);
    const R = new Float32Array(N * 6);
    const geo = new LineSegmentsGeometry();
    geo.setPositions(R);
    const buf = (geo.attributes.instanceStart as THREE.InterleavedBufferAttribute).data;
    const mat = new LineMaterial({ color: INK.getHex(), linewidth: 1.3, transparent: true, opacity: 0.88, depthTest: false });
    const lines = new LineSegments2(geo, mat);
    lines.frustumCulled = false;
    const group = new THREE.Group();
    group.add(lines);
    scene.add(group);

    // per-segment scatter direction, used when the visitor clicks to redraw
    const scatter = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const r = 0.6 + Math.random() * 0.9;
      const d = [Math.sin(b) * Math.cos(a) * r, Math.sin(b) * Math.sin(a) * r, Math.cos(b) * r];
      scatter.set([...d, ...d], i * 6);
    }

    let anchors: { top: number; fig: number }[] = [];
    let darks: { top: number; bottom: number }[] = [];
    const measure = () => {
      const y = window.scrollY;
      anchors = [...document.querySelectorAll<HTMLElement>('[data-fig]')]
        .map((el) => ({ top: el.getBoundingClientRect().top + y, fig: Number(el.dataset.fig) }))
        .sort((a, b) => a.top - b.top);
      darks = [...document.querySelectorAll<HTMLElement>('[data-ground="dark"]')].map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y };
      });
    };

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1), 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mat.resolution.set(w, h);
      measure();
    };

    const ptr = { x: 0, y: 0, tx: 0, ty: 0, over: 0, overT: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      ptr.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.5)));
      ptr.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.5)));
      ptr.overT = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom ? 1 : 0;
    };
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    let burst = 0;
    const onClick = () => {
      burst = 1;
      if (reduce) burst = 0;
      start();
    };
    wrap.addEventListener('click', onClick);

    const color = new THREE.Color();
    let caption = -1;
    let visible = false;
    let dark = 0;
    let spin = 0;
    const target = new Float32Array(N * 6);

    function compute(dt: number) {
      const vh = window.innerHeight;
      const narrow = narrowMq.matches;
      let from = 0;
      let to = 0;
      let t = 0;
      let show = false;

      if (narrow) {
        let best: HTMLElement | null = null;
        for (const el of document.querySelectorAll<HTMLElement>('[data-inter]')) {
          const r = el.getBoundingClientRect();
          const c = (r.top + r.bottom) / 2;
          if (c > vh * 0.12 && c < vh * 0.95) best = el;
        }
        show = !!best;
        if (best) from = to = Number(best.dataset.inter);
        else from = to = caption < 0 ? 0 : caption;
      } else if (anchors.length) {
        const ref = window.scrollY + vh * 0.55;
        show = ref > anchors[0].top - vh * 0.1;
        let i = 0;
        for (let k = 0; k < anchors.length; k++) if (anchors[k].top <= ref) i = k;
        const a = anchors[i];
        const b = anchors[i + 1];
        from = a.fig;
        to = b ? b.fig : a.fig;
        if (b && b.fig !== a.fig) {
          const W = vh * 0.55;
          t = smooth(clamp01((ref - (b.top - W)) / W));
          if (reduce) t = t > 0.5 ? 1 : 0;
        }
      }

      const A = shapes[from];
      const B = shapes[to];
      for (let i = 0; i < N * 6; i++) target[i] = A[i] + (B[i] - A[i]) * t;
      const k = reduce ? 1 : 1 - Math.exp(-dt * (narrow ? 3.4 : 8));
      for (let i = 0; i < N * 6; i++) P[i] += (target[i] - P[i]) * k;

      const capIdx = t > 0.5 ? to : from;
      if (capIdx !== caption) {
        caption = capIdx;
        if (capRef.current) capRef.current.textContent = FIGURE_CAPTIONS[capIdx];
      }

      if (show !== visible) {
        visible = show;
        wrap.dataset.visible = show ? 'true' : 'false';
      }

      // ink on paper, paper on ink: read the ground behind the figure's centre
      const r = canvas.getBoundingClientRect();
      const cy = window.scrollY + r.top + r.height / 2;
      const onDark = darks.some((d) => cy > d.top && cy < d.bottom) ? 1 : 0;
      dark += (onDark - dark) * (reduce ? 1 : Math.min(1, dt * 6));
      wrap.dataset.dark = dark > 0.5 ? 'true' : 'false';
    }

    function tick(dt: number) {
      compute(dt);
      const kp = Math.min(1, dt * 3);
      ptr.x += (ptr.tx - ptr.x) * kp;
      ptr.y += (ptr.ty - ptr.y) * kp;
      ptr.over += (ptr.overT - ptr.over) * Math.min(1, dt * 5);
      if (!reduce) spin += dt * (0.16 + ptr.over * 0.5);
      group.rotation.set(ptr.y * 0.35, spin * 0.6 + ptr.x * 0.6, 0);
      group.scale.setScalar(1 + ptr.over * 0.05);

      burst = Math.max(0, burst - dt * 0.9);
      const bb = burst * burst * (3 - 2 * burst);
      const arr = buf.array as Float32Array;
      for (let i = 0; i < N * 6; i++) arr[i] = P[i] + scatter[i] * bb;
      buf.needsUpdate = true;

      color.copy(INK).lerp(PAPER, dark);
      mat.color.copy(color);
      renderer.render(scene, camera);
    }

    let raf = 0;
    let running = false;
    let last = 0;
    let idle = 0;
    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tick(dt);
      idle = visible ? 0 : idle + dt;
      if (idle > 1 || (reduce && burst === 0)) stop();
    };
    function start() {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onScroll = () => start();
    const onVis = () => (document.hidden ? stop() : start());
    const onResize = () => {
      resize();
      start();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => {
      measure();
      start();
    });
    ro.observe(document.body);
    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      wrap.removeEventListener('click', onClick);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div ref={wrapRef} className={s.figure} data-visible="false" data-dark="false">
      <button type="button" className={s.figureBtn} aria-label="Redraw the margin figure">
        <canvas ref={canvasRef} className={s.figureCanvas} aria-hidden="true" />
      </button>
      <p className={s.figureCap} aria-hidden="true">
        <span className={s.figureCapLabel}>In the margin</span>
        <span ref={capRef}>{FIGURE_CAPTIONS[0]}</span>
      </p>
    </div>
  );
}
