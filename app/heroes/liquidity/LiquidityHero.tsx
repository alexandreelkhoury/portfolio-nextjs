'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './liquidity.module.css';
import { VERT, BACKDROP_FRAG, LIQUID_FRAG, FG_FRAG } from './shaders';
import { work } from './work';
import {
  pickLayout, targets, cameraAt, project, rayFrom, blendK, wobbleAt, smooth,
  type Layout, type V3, SAG, sub, add, scale, dot, norm,
} from './scene';

type Prog = { gl: WebGL2RenderingContext; prog: WebGLProgram; u: (n: string) => WebGLUniformLocation | null };

function makeProgram(canvas: HTMLCanvasElement, frag: string): Prog | null {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const o = gl.createShader(type)!;
    gl.shaderSource(o, src);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(o));
      return null;
    }
    return o;
  };
  const v = sh(gl.VERTEX_SHADER, VERT);
  const f = sh(gl.FRAGMENT_SHADER, frag);
  if (!v || !f) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (n: string) => {
    if (!cache.has(n)) cache.set(n, gl.getUniformLocation(prog, n));
    return cache.get(n)!;
  };
  return { gl, prog, u };
}

const NS = 7;

export default function LiquidityHero({ fontClass }: { fontClass: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const liqRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const fgWrapRef = useRef<HTMLDivElement>(null);
  const fgDriftRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current!, hero = heroRef.current!, stage = stageRef.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);

    const bg0 = makeProgram(bgRef.current!, BACKDROP_FRAG);
    const lq0 = makeProgram(liqRef.current!, LIQUID_FRAG);
    const fg0 = makeProgram(fgRef.current!, FG_FRAG);
    if (!bg0 || !lq0 || !fg0) {
      root.classList.add(s.noGL);
      return;
    }
    const bg: Prog = bg0, lq: Prog = lq0, fg: Prog = fg0;

    // video texture for the first droplet
    const video = document.createElement('video');
    video.src = '/media/spl-hero-loop.mp4';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    const vtex = lq.gl.createTexture();
    {
      const gl = lq.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, vtex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([60, 58, 55, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(lq.u('uVid'), 0);
    }
    let videoOK = false;

    // ---- state
    let W = 0, H = 0, L: Layout = pickLayout(window.innerWidth, window.innerHeight);
    let quality = 1;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    let pTarget = reduced ? 1 : 0, pS = pTarget;
    const pos: V3[] = [], vel: V3[] = [], rad: number[] = [];
    const seed = () => {
      const T = targets(L, pS, 0);
      for (let i = 0; i < NS; i++) {
        pos[i] = [...T[i].pos] as V3;
        vel[i] = [0, 0, 0];
        rad[i] = T[i].r;
      }
    };
    seed();

    const ptr = { sx: -1, sy: -1, inside: false, amt: 0, P: [0, 0.5, 0] as V3, prevP: null as V3 | null };
    const ripples = new Float32Array(16).fill(-100);
    let ripIdx = 0;
    const labelW: number[] = [], labelH: number[] = [];

    const resize = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      L = pickLayout(W, H);
      const ld = Math.min(dpr, 1.5) * quality;
      lq.gl.canvas.width = Math.round(W * ld);
      lq.gl.canvas.height = Math.round(H * ld);
      const bd = Math.max(0.5, dpr * 0.5);
      bg.gl.canvas.width = Math.round(W * bd);
      bg.gl.canvas.height = Math.round(H * bd);
      const fw = fgRef.current!.clientWidth;
      fg.gl.canvas.width = fg.gl.canvas.height = Math.max(64, Math.round(fw * 0.22 * dpr));
      labelRefs.current.forEach((el, i) => {
        labelW[i] = el?.offsetWidth ?? 0;
        labelH[i] = el?.offsetHeight ?? 0;
      });
      seed();
      draw(0);
    };

    // ---- pointer
    const toLocal = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const nearest = (o: V3, d: V3) => {
      let best = 1e9, P: V3 = [0, 0.5, 0], idx = 0;
      for (let i = 0; i < NS; i++) {
        if (rad[i] < 0.02) continue;
        const t = Math.max(0, dot(sub(pos[i], o), d));
        const Pi = add(o, scale(d, t));
        const dist = Math.hypot(...sub(pos[i], Pi)) - rad[i];
        if (dist < best) { best = dist; P = Pi; idx = i; }
      }
      return { P, idx, dist: best };
    };
    const onMove = (e: PointerEvent) => {
      if (reduced) return;
      [ptr.sx, ptr.sy] = toLocal(e);
      ptr.inside = e.pointerType === 'mouse' || e.buttons > 0;
    };
    const onLeave = () => { ptr.inside = false; ptr.prevP = null; };
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      [ptr.sx, ptr.sy] = toLocal(e);
      ptr.inside = true;
      const cam = cameraAt(L, pS);
      const ray = rayFrom(cam, ptr.sx, ptr.sy, W, H);
      const n = nearest(ray.o, ray.d);
      const c = pos[n.idx];
      const dir = norm(sub(n.P, c));
      const surf = add(c, scale(dir, rad[n.idx]));
      ripples.set([surf[0], surf[1], surf[2], clock], ripIdx * 4);
      ripIdx = (ripIdx + 1) % 4;
      for (let i = 0; i < NS; i++) {
        const dd = Math.hypot(...sub(pos[i], surf));
        const f = Math.exp(-dd * dd * 0.9) * (n.dist < 0.6 ? 1 : 0.35);
        vel[i][1] += 2.1 * f;
        const away = norm([pos[i][0] - surf[0], 0, pos[i][2] - surf[2]]);
        vel[i][0] += away[0] * 0.9 * f;
        vel[i][2] += away[2] * 0.9 * f;
      }
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') onLeave(); });

    // ---- render
    let clock = 0;
    const sph = new Float32Array(NS * 4), vl = new Float32Array(NS * 4);

    const setCommon = (P: Prog, cam: ReturnType<typeof cameraAt>, w: number, h: number) => {
      const { gl, u } = P;
      gl.useProgram(P.prog);
      gl.uniform4fv(u('uSph'), sph);
      gl.uniform2f(u('uRes'), w, h);
      gl.uniform1f(u('uTime'), clock);
      gl.uniform3fv(u('uCamPos'), cam.pos);
      gl.uniform3fv(u('uCamTgt'), cam.tgt);
      gl.uniform1f(u('uTanH'), Math.tan((cam.fov * Math.PI) / 360));
      gl.viewport(0, 0, w, h);
    };

    function draw(dt: number) {
      if (!W) return;
      pS += (pTarget - pS) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
      const cam = cameraAt(L, pS);
      const T = targets(L, pS, reduced ? 0 : clock);

      // pointer in world space
      let ptrDelta: V3 | null = null;
      if (ptr.sx >= 0) {
        const ray = rayFrom(cam, ptr.sx, ptr.sy, W, H);
        const n = nearest(ray.o, ray.d);
        ptr.P = n.P;
        if (ptr.inside && ptr.prevP) ptrDelta = sub(n.P, ptr.prevP);
        ptr.prevP = ptr.inside ? n.P : null;
      }
      ptr.amt += ((ptr.inside ? 1 : 0) - ptr.amt) * (1 - Math.exp(-dt * 4));

      // springs: the droplets follow their targets with a little overshoot
      if (reduced || dt === 0) {
        for (let i = 0; i < NS; i++) { pos[i] = [...T[i].pos] as V3; rad[i] = T[i].r; vel[i] = [0, 0, 0]; }
      } else {
        const steps = 2, h = Math.min(dt, 1 / 30) / steps;
        for (let k = 0; k < steps; k++) {
          for (let i = 0; i < NS; i++) {
            for (let a = 0; a < 3; a++) {
              const acc = 58 * (T[i].pos[a] - pos[i][a]) - 7.5 * vel[i][a];
              vel[i][a] += acc * h;
              pos[i][a] += vel[i][a] * h;
            }
            rad[i] += (T[i].r - rad[i]) * Math.min(1, h * 9);
          }
        }
        if (ptrDelta) {
          for (let i = 0; i < NS; i++) {
            const dd = Math.hypot(...sub(pos[i], ptr.P));
            const f = Math.exp(-((dd / (rad[i] + 0.3)) ** 2)) * 0.9;
            vel[i][0] += Math.max(-0.25, Math.min(0.25, ptrDelta[0] * f));
            vel[i][2] += Math.max(-0.25, Math.min(0.25, ptrDelta[2] * f));
          }
        }
      }
      for (let i = 0; i < NS; i++) {
        sph.set([pos[i][0], Math.max(pos[i][1], rad[i] / SAG * 0.8), pos[i][2], rad[i]], i * 4);
        vl.set([vel[i][0], vel[i][1], vel[i][2], 0], i * 4);
      }

      // backdrop
      setCommon(bg, cam, bg.gl.canvas.width, bg.gl.canvas.height);
      bg.gl.uniform1f(bg.u('uFade'), smooth(0.86, 1, pS) * 0.6);
      bg.gl.drawArrays(bg.gl.TRIANGLES, 0, 3);

      // liquid
      const gl = lq.gl;
      setCommon(lq, cam, gl.canvas.width, gl.canvas.height);
      gl.uniform4fv(lq.u('uVel'), vl);
      gl.uniform1f(lq.u('uK'), blendK(pS));
      gl.uniform1f(lq.u('uWob'), reduced ? 0.4 : wobbleAt(pS));
      gl.uniform3fv(lq.u('uPtr'), ptr.P);
      gl.uniform1f(lq.u('uPtrAmt'), ptr.amt);
      gl.uniform4fv(lq.u('uRip'), ripples);
      const vidMix = smooth(0.56, 0.72, pS);
      if (vidMix > 0 && !reduced) {
        if (video.paused) video.play().then(() => { videoOK = true; }).catch(() => {});
        if (videoOK && video.readyState >= 2) {
          gl.bindTexture(gl.TEXTURE_2D, vtex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        }
      } else if (!video.paused) video.pause();
      gl.uniform1f(lq.u('uVidMix'), videoOK ? vidMix : 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // foreground droplet (only while it is on screen)
      if (pS < 0.75) {
        setCommon(fg, cam, fg.gl.canvas.width, fg.gl.canvas.height);
        fg.gl.uniform1f(fg.u('uSpin'), clock * 0.12 + pS * 2.4);
        fg.gl.clearColor(0, 0, 0, 0);
        fg.gl.clear(fg.gl.COLOR_BUFFER_BIT);
        fg.gl.drawArrays(fg.gl.TRIANGLES, 0, 3);
        if (fgDriftRef.current && !reduced) {
          fgDriftRef.current.style.transform = `translate3d(${Math.sin(clock * 0.21) * 1.6}vw, ${Math.cos(clock * 0.17) * 1.2}vw, 0)`;
        }
      }

      // gallery labels follow their droplets
      const mobile = L.name === 'mobile';
      for (let i = 0; i < 5; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const bot = project(cam, [pos[i][0], 0, pos[i][2]], W, H);
        const top = project(cam, [pos[i][0], (2 * rad[i]) / SAG, pos[i][2]], W, H);
        const side = project(cam, [pos[i][0] + rad[i], pos[i][1], pos[i][2]], W, H);
        const rpx = side[0] - bot[0];
        let x: number, y: number;
        if (!mobile) {
          x = bot[0] - labelW[i] / 2;
          y = bot[1] + 18;
        } else {
          const left = L.final[i][0] < 0;
          x = left ? bot[0] + rpx + 14 : bot[0] - rpx - 14 - labelW[i];
          y = (top[1] + bot[1]) / 2 - labelH[i] / 2;
        }
        x = Math.max(12, Math.min(W - labelW[i] - 12, x));
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    }

    // adaptive quality: drop liquid resolution if frames are slow
    let slow = 0, fast = 0;
    let raf = 0, last = 0, running = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      clock += dt;
      draw(dt);
      if (dt > 0.03) slow++; else fast++;
      if (slow > 40 && quality > 0.55) { quality -= 0.15; slow = fast = 0; resize(); }
      if (fast > 600) { slow = 0; fast = 0; }
    };
    const start = () => { if (!running && !reduced) { running = true; last = 0; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); video.pause(); };

    // ---- scroll choreography (DOM layers)
    const ctx = gsap.context(() => {
      const h1 = h1Ref.current!, subEl = subRef.current!;
      const fin = () => {
        const mobile = pickLayout(window.innerWidth, window.innerHeight).name === 'mobile';
        const g = h1.offsetLeft;
        const sc = mobile ? 0.5 : 0.34;
        const top = window.innerHeight * (mobile ? 0.055 : 0.07);
        return { g, sc, top, mobile };
      };
      const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
      tl.to(h1, {
        x: () => fin().g - h1.offsetLeft,
        y: () => fin().top - h1.offsetTop,
        scale: () => fin().sc,
        duration: 0.34,
        ease: 'power2.inOut',
      }, 0.1);
      // the subline steps out while the name settles, then reappears beside it
      tl.to(subEl, { opacity: 0, y: '-=14', duration: 0.1, ease: 'power1.in' }, 0.08);
      tl.set(subEl, {
        x: () => (fin().mobile ? fin().g : fin().g + h1.offsetWidth * fin().sc + 40) - subEl.offsetLeft,
        y: () => (fin().mobile ? fin().top + h1.offsetHeight * fin().sc + 10 : fin().top + 8) - subEl.offsetTop + 10,
      }, 0.3);
      tl.to(subEl, { opacity: 1, y: '-=10', duration: 0.1, ease: 'power2.out' }, 0.42);
      tl.to(capRef.current, { opacity: 0, y: -12, duration: 0.14 }, 0.06);
      tl.to(fgWrapRef.current, {
        x: () => window.innerWidth * (pickLayout(window.innerWidth, window.innerHeight).name === 'mobile' ? -1.1 : 1.25),
        y: () => -window.innerHeight * 1.05,
        scale: 1.15,
        duration: 0.62,
        ease: 'power1.in',
      }, 0);
      labelRefs.current.forEach((el, i) => {
        const inner = el?.firstElementChild;
        if (inner) tl.fromTo(inner, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.64 + i * 0.035);
      });
      tl.to(fadeRef.current, { opacity: 1, duration: 0.14 }, 0.86);
      tl.set({}, {}, 1);

      if (reduced) {
        tl.progress(1);
      } else {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: (self) => { pTarget = self.progress; },
          onRefresh: (self) => { pTarget = self.progress; },
        });
      }
    }, root);

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '80px' });
    io.observe(hero);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => resize());
    ro.observe(stage);
    resize();
    (window as unknown as { __liq?: unknown }).__liq = { get p() { return pS; }, get quality() { return quality; } };

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointerleave', onLeave);
      ctx.revert();
      video.removeAttribute('src');
      video.load();
      [bg, lq, fg].forEach((P) => P.gl.getExtension('WEBGL_lose_context')?.loseContext());
    };
  }, []);

  return (
    <div ref={rootRef} className={`${s.root} ${fontClass}`}>
      <section ref={heroRef} className={s.hero} aria-label="Introduction">
        <div ref={stageRef} className={s.stage}>
          <canvas ref={bgRef} className={s.backdrop} aria-hidden="true" />
          <div className={s.copy}>
            <h1 ref={h1Ref} className={s.h1}>
              <span className={s.line}>Alexandre</span>
              <span className={s.line}>El-Khoury</span>
            </h1>
            <p ref={subRef} className={s.sub}>
              Blockchain &amp; full-stack developer. <span className={s.accent}>I make liquidity behave.</span>
            </p>
            <p ref={capRef} className={s.caption}>Currently building at Sovra, Paris.</p>
          </div>
          <canvas ref={liqRef} className={s.liquid} aria-hidden="true" />
          <div ref={fadeRef} className={s.fade} aria-hidden="true" />
          <ul className={s.labels} aria-label="Selected work">
            {work.map((w, i) => (
              <li key={w.title} ref={(el) => { labelRefs.current[i] = el; }} className={s.label}>
                <div className={s.labelIn}>
                  <a href={w.url} target="_blank" rel="noreferrer" className={s.title}>{w.title}</a>
                  <span className={s.medium}>{w.medium}</span>
                  <span className={s.desc}>{w.line}</span>
                </div>
              </li>
            ))}
          </ul>
          <div ref={fgWrapRef} className={s.fg} aria-hidden="true">
            <div ref={fgDriftRef} className={s.fgDrift}>
              <canvas ref={fgRef} className={s.fgCanvas} />
            </div>
          </div>
        </div>
      </section>
      <section className={s.stub}>
        <h2 className={s.stubTitle}>Chapter 1 continues here</h2>
      </section>
    </div>
  );
}
