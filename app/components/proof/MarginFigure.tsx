'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { getShapes, N } from './figureShapes';
import { FIGURE_CAPTIONS } from './content';
import { marginRect } from './geometry';
import s from './site.module.css';

/*
 * The figure that keeps proving itself. One drawing of N ink segments lives in the
 * margin for the whole page. Elements marked data-fig="k" are anchors: as the next
 * anchor arrives, every segment travels from shape i to shape j, so the drawing
 * re-forms instead of crossfading.
 * Desktop: fixed in the right margin. At each intertitle it FLIPs to the centre of the
 * page (72vmin, behind the title), morphs to the chapter's shape while big, then goes back.
 * Narrow screens: the same canvas sits inline in each intertitle's slot (data-fig-slot).
 */

const INK = new THREE.Color('#17150f');
const PAPER = new THREE.Color('#efe9dd');
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const inOut3 = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const LW = 1.8;

type Anchor = { start: number; end: number; fig: number };

export default function MarginFigure() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const capTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const btn = btnRef.current!;
    const capEl = capRef.current!;
    const canvas = document.createElement('canvas');
    canvas.className = s.figureCanvas;
    canvas.setAttribute('aria-hidden', 'true');
    btn.appendChild(canvas);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrowMq = window.matchMedia('(max-width: 1099px)');
    const shapes = getShapes();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 3.7);

    const P = new Float32Array(shapes[0]);
    const R = new Float32Array(N * 6);
    const geo = new LineSegmentsGeometry();
    geo.setPositions(R);
    const buf = (geo.attributes.instanceStart as THREE.InterleavedBufferAttribute).data;
    const mat = new LineMaterial({ color: INK.getHex(), linewidth: LW, transparent: true, opacity: 1, depthTest: false });
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

    let anchors: Anchor[] = [];
    let darks: { top: number; bottom: number }[] = [];
    let inters: HTMLElement[] = [];
    let hides: HTMLElement[] = [];
    let slots: HTMLElement[] = [];
    let firstTop = 0;
    const measure = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const narrow = narrowMq.matches;
      anchors = [...document.querySelectorAll<HTMLElement>('[data-fig]')]
        .map((el) => {
          const top = el.getBoundingClientRect().top + y;
          const fig = Number(el.dataset.fig);
          // a sticky intertitle morphs while it is held; anything else as it rises to the reading line
          if (!narrow && el.hasAttribute('data-inter')) return { start: top + vh * 0.02, end: top + vh * 0.3, fig };
          return { start: top - vh * 1.1, end: top - vh * 0.55, fig };
        })
        .sort((a, b) => a.start - b.start);
      firstTop = anchors.length ? anchors[0].end + vh * 0.55 : 0;
      darks = [...document.querySelectorAll<HTMLElement>('[data-ground="dark"]')].map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y };
      });
      inters = [...document.querySelectorAll<HTMLElement>('[data-inter]')];
      hides = [...document.querySelectorAll<HTMLElement>('[data-fig-hide]')];
      slots = [...document.querySelectorAll<HTMLElement>('[data-fig-slot]')];
    };

    // desktop geometry: the canvas is drawn at its big size and scaled down into the margin
    let big = 600;
    let home = { x: 0, y: 0, w: 300 };
    let host: HTMLElement = btn;
    const resize = () => {
      const W = window.innerWidth;
      const vh = window.innerHeight;
      const narrow = narrowMq.matches;
      if (!narrow) {
        home = marginRect(W, vh);
        big = Math.round(Math.max(home.w, Math.min(W, vh) * 0.72));
        wrap.style.width = `${big}px`;
        wrap.style.height = `${big}px`;
        capEl.style.transform = `translate3d(${home.x}px, ${(home.y + home.w + 8).toFixed(1)}px, 0)`;
        capEl.style.width = `${home.w}px`;
        if (host !== btn) {
          btn.appendChild(canvas);
          host = btn;
        }
      } else {
        wrap.style.width = '';
        wrap.style.height = '';
        wrap.style.transform = '';
      }
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
      burst = reduce ? 0 : 1;
      start();
    };
    canvas.addEventListener('click', onClick);

    const color = new THREE.Color();
    let caption = -1;
    let visible = false;
    let dark = 0;
    let spin = 0;
    let center = 0;
    const target = new Float32Array(N * 6);

    function compute(dt: number) {
      const vh = window.innerHeight;
      const narrow = narrowMq.matches;
      let from = 0;
      let to = 0;
      let t = 0;
      let show = false;
      let c = 0;

      if (narrow) {
        // inline: the slot nearest the middle of the screen hosts the canvas
        let best: HTMLElement | null = null;
        let bd = Infinity;
        for (const el of slots) {
          const r = el.getBoundingClientRect();
          if (r.bottom < -vh * 0.5 || r.top > vh * 1.5 || r.height === 0) continue;
          const d = Math.abs(r.top + r.height / 2 - vh / 2);
          if (d < bd) {
            bd = d;
            best = el;
          }
        }
        show = !!best;
        if (best) {
          if (host !== best) {
            best.appendChild(canvas);
            host = best;
            resize();
          }
          to = Number(best.dataset.figSlot);
          from = Math.max(0, to - 1);
          const r = best.getBoundingClientRect();
          t = reduce ? 1 : smooth(clamp01((vh * 0.95 - r.top) / (vh * 0.55)));
        }
      } else if (anchors.length) {
        const y = window.scrollY;
        show = y > firstTop - vh * 0.65;
        let i = -1;
        for (let k = 0; k < anchors.length; k++) if (anchors[k].start <= y) i = k;
        if (i < 0) from = to = anchors[0].fig;
        else {
          const a = anchors[i];
          from = i > 0 ? anchors[i - 1].fig : a.fig;
          to = a.fig;
          t = smooth(clamp01((y - a.start) / Math.max(1, a.end - a.start)));
          if (reduce) t = t > 0.5 ? 1 : 0;
        }
        // the trip to the centre at each intertitle
        if (!reduce)
          for (const el of inters) {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) continue;
            const held = Math.max(vh, r.height - vh);
            const ret = el.dataset.ret ? Number(el.dataset.ret) * vh : held - vh * 0.25;
            const go = inOut3(clamp01((vh * 0.45 - r.top) / (vh * 0.45)));
            const back = inOut3(clamp01((-r.top - ret) / (vh * 0.5)));
            c = Math.max(c, go * (1 - back));
          }
        for (const el of hides) {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.02 && r.bottom > vh * 0.5) show = false;
        }
      }
      const kc = reduce ? 1 : Math.min(1, dt * 10);
      center += (c - center) * kc;

      const A = shapes[from];
      const B = shapes[to];
      for (let i = 0; i < N * 6; i++) target[i] = A[i] + (B[i] - A[i]) * t;
      const k = reduce ? 1 : 1 - Math.exp(-dt * (narrow ? 3.4 : 8));
      for (let i = 0; i < N * 6; i++) P[i] += (target[i] - P[i]) * k;

      const capIdx = t > 0.5 ? to : from;
      if (capIdx !== caption) {
        caption = capIdx;
        if (capTextRef.current) capTextRef.current.textContent = FIGURE_CAPTIONS[capIdx];
      }

      if (show !== visible) {
        visible = show;
        wrap.dataset.visible = show && !narrow ? 'true' : 'false';
      }
      capEl.dataset.visible = visible && !narrow && center < 0.04 ? 'true' : 'false';
      wrap.dataset.center = center > 0.1 ? 'true' : 'false';

      // ink on paper, paper on ink: read the ground behind the figure's centre
      const r = canvas.getBoundingClientRect();
      const cy = window.scrollY + r.top + r.height / 2;
      const onDark = darks.some((d) => cy > d.top && cy < d.bottom) ? 1 : 0;
      dark += (onDark - dark) * (reduce ? 1 : Math.min(1, dt * 6));
      wrap.dataset.dark = dark > 0.5 ? 'true' : 'false';
      capEl.dataset.dark = wrap.dataset.dark;
    }

    function tick(dt: number) {
      compute(dt);
      const narrow = narrowMq.matches;
      let scale = 1;
      if (!narrow) {
        const W = window.innerWidth;
        const vh = window.innerHeight;
        const e = center;
        const k0 = home.w / big;
        scale = k0 + (1 - k0) * e;
        const x = home.x + ((W - big) / 2 - home.x) * e;
        const y = home.y + ((vh - big) / 2 - home.y) * e;
        wrap.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      }
      // the drawn line keeps the same width on screen whatever the scale
      mat.linewidth = LW / scale;
      mat.opacity = 1 - 0.45 * center;

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
      if (!canvas.dataset.ready) {
        canvas.dataset.ready = 'true';
        wrap.dataset.ready = 'true';
      }
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
      canvas.removeEventListener('click', onClick);
      canvas.remove();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <>
      <div ref={wrapRef} className={s.figure} data-visible="false" data-dark="false" data-center="false">
        <button ref={btnRef} type="button" className={s.figureBtn} aria-label="Redraw the margin figure">
          <svg className={s.ph} viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <ellipse cx="50" cy="50" rx="36" ry="15" />
            <ellipse cx="50" cy="50" rx="24" ry="10" opacity="0.5" />
          </svg>
        </button>
      </div>
      <p ref={capRef} className={s.figureCap} data-visible="false" aria-hidden="true">
        <span className={s.figureCapLabel}>In the margin</span>
        <span ref={capTextRef}>{FIGURE_CAPTIONS[0]}</span>
      </p>
    </>
  );
}
