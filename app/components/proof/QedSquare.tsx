'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { getShapes, N } from './figureShapes';
import { marginRect } from './geometry';
import s from './site.module.css';

/*
 * The ending loops to the beginning. The tombstone leaves the margin and grows to
 * 90vmin; inside it, the title page's Enneper surface redraws itself in paper on ink.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);

export default function QedSquare({ children }: { children: ReactNode }) {
  const runRef = useRef<HTMLDivElement>(null);
  const sqRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const run = runRef.current!;
    const sq = sqRef.current!;
    const holder = holderRef.current!;
    const cap = capRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.createElement('canvas');
    canvas.className = s.qedCanvas;
    canvas.setAttribute('aria-hidden', 'true');
    holder.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 3.9);
    const geo = new LineSegmentsGeometry();
    geo.setPositions(getShapes()[0]);
    const mat = new LineMaterial({ color: 0xf2ede3, linewidth: 1.3, transparent: true, opacity: 0.95, depthTest: false });
    const lines = new LineSegments2(geo, mat);
    lines.frustumCulled = false;
    const group = new THREE.Group();
    group.rotation.x = -0.5;
    group.add(lines);
    scene.add(group);

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1), 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mat.resolution.set(w, h);
    };
    resize();

    const st = { p: reduce ? 1 : 0 };
    let spin = 0;
    const paint = () => {
      const p = st.p;
      const draw = reduce ? 1 : clamp01((p - 0.28) / 0.6);
      geo.instanceCount = Math.max(0, Math.round(draw * N));
      group.rotation.y = -0.4 + spin;
      renderer.render(scene, camera);
      holder.dataset.ready = 'true';
    };
    const place = () => {
      const p = st.p;
      if (reduce) return;
      const W = window.innerWidth;
      const vh = window.innerHeight;
      const S = Math.min(W, vh) * 0.9;
      let cx = W / 2;
      let cy = vh / 2;
      let s0 = 18;
      if (W >= 1100) {
        const m = marginRect(W, vh);
        s0 = m.w * 0.42;
        cx = m.x + m.w / 2;
        cy = m.y + m.w / 2;
      }
      const g = inOut(clamp01(p / 0.55));
      const k = (s0 + (S - s0) * g) / S;
      const dx = (cx - W / 2) * (1 - g);
      const dy = (cy - vh / 2) * (1 - g);
      sq.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
      sq.style.opacity = p > 0.002 ? '1' : '0';
      run.dataset.held = p > 0.002 ? 'true' : 'false';
      cap.style.opacity = clamp01((p - 0.78) / 0.14).toFixed(3);
    };

    let raf = 0;
    let inView = false;
    let last = performance.now();
    const loop = (now: number) => {
      raf = 0;
      if (!inView || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) spin += dt * 0.12;
      paint();
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && inView) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) kick();
    });
    io.observe(run);
    const onResize = () => {
      resize();
      place();
      inView && paint();
    };
    window.addEventListener('resize', onResize);
    const onVis = () => kick();
    document.addEventListener('visibilitychange', onVis);

    let tw: gsap.core.Tween | null = null;
    if (!reduce) {
      place();
      tw = gsap.to(st, {
        p: 1,
        ease: 'none',
        onUpdate: place,
        scrollTrigger: { trigger: run, start: 'top top', end: 'bottom bottom', scrub: 0.8, onRefresh: place },
      });
    } else {
      cap.style.opacity = '1';
    }

    return () => {
      tw?.scrollTrigger?.kill();
      tw?.kill();
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return (
    <div ref={runRef} className={s.qedRun} data-fig={6} data-fig-hide>
      <div className={s.qedStick}>
        <div ref={sqRef} className={s.qedSquare} aria-hidden="true">
          <div ref={holderRef} className={s.qedHolder} data-ready="false">
            <svg className={s.ph} viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <ellipse cx="50" cy="50" rx="34" ry="14" />
              <ellipse cx="50" cy="50" rx="22" ry="9" opacity="0.5" />
            </svg>
          </div>
        </div>
        <p ref={capRef} className={s.qedFig}>
          Fig. 1, again.
        </p>
        {children}
      </div>
    </div>
  );
}
