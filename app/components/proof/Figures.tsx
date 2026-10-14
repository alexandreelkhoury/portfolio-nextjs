'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, PerspectiveCamera, View } from '@react-three/drei';
import { buildDevice, type Device } from './devices';
import { MOTION, PROJECTS, type Project } from './content';
import s from './site.module.css';

/*
 * Chapter IV. Every device is drawn in one fixed canvas through drei <View>.
 * Desktop with motion: one pinned stage, about 110vh of scroll per project. Each
 * project swings in, holds with its screen on, then pushes in as the hand-off to the
 * next. The motion work follows as a pinned horizontal reel.
 * Mobile, touch and reduced motion: the same plates, stacked in the flow, no pins.
 */

const INK = '#17150f';
const PAPER = '#f6f2ea';
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const p2out = (v: number) => 1 - (1 - v) * (1 - v);
const p2in = (v: number) => v * v;
const ease3 = (v: number) => 1 - Math.pow(1 - v, 3);
const SEG = 1.1; // viewport heights of scroll per project
const TURN = 0.26; // the first-view nudge, about 15 degrees

export const posterOf = (src: string) => src.replace('/media/', '/media/posters/').replace(/\.mp4$/, '.jpg');

type Ctl = {
  tx: number;
  ty: number;
  x: number;
  y: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  lastT: number;
  vel: number;
  rotY: number;
  rotX: number;
  idle: number;
  nudge: number;
};
const newCtl = (): Ctl => ({ tx: 0, ty: 0, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0, lastT: 0, vel: 0, rotY: 0, rotX: 0, idle: 0, nudge: 0 });

type Reg = { video: HTMLVideoElement | null; ctl: Ctl };
type Mode = 'stage' | 'flow';

function useMode(): { mode: Mode; reduce: boolean; touch: boolean } {
  const [st, setSt] = useState<{ mode: Mode; reduce: boolean; touch: boolean }>({ mode: 'stage', reduce: false, touch: false });
  useEffect(() => {
    const mqR = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqW = window.matchMedia('(min-width: 900px) and (pointer: fine)');
    const on = () => {
      const reduce = mqR.matches;
      const touch = window.matchMedia('(pointer: coarse)').matches;
      setSt({ reduce, touch, mode: !reduce && mqW.matches ? 'stage' : 'flow' });
    };
    on();
    mqR.addEventListener('change', on);
    mqW.addEventListener('change', on);
    return () => {
      mqR.removeEventListener('change', on);
      mqW.removeEventListener('change', on);
    };
  }, []);
  return st;
}

function useInView(ref: RefObject<Element | null>, margin = '0px', threshold = 0.2) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, threshold]);
  return v;
}

/* ---------- media textures: the poster first, the video once it has a frame ---------- */

function useMediaTexture(media: Project['media'], playing: boolean, videoOut: RefObject<HTMLVideoElement | null>) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    const owned: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    const keep = (t: THREE.Texture) => {
      t.colorSpace = THREE.SRGBColorSpace;
      owned.push(t);
      return t;
    };
    if (media.kind === 'video') {
      loader.load(posterOf(media.src), (img) => {
        if (disposed) return img.dispose();
        setTex((cur) => cur ?? keep(img));
      });
      const v = document.createElement('video');
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'metadata';
      v.src = media.src;
      videoOut.current = v;
      const vt = keep(new THREE.VideoTexture(v));
      v.addEventListener('loadeddata', () => !disposed && setTex(vt), { once: true });
    } else {
      loader.load(media.src, (img) => {
        if (disposed) return img.dispose();
        img.anisotropy = 4;
        setTex(keep(img));
      });
    }
    return () => {
      disposed = true;
      const v = videoOut.current;
      if (v) {
        v.pause();
        v.removeAttribute('src');
        v.load();
      }
      videoOut.current = null;
      owned.forEach((t) => t.dispose());
    };
  }, [media.kind, media.src, videoOut]);

  useEffect(() => {
    const v = videoOut.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing, tex, videoOut]);

  return tex;
}

/** object-fit: cover for a texture on a screen of aspect `screen` */
function cover(tex: THREE.Texture, mediaAspect: number, screen: number) {
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  if (mediaAspect > screen) {
    tex.repeat.set(screen / mediaAspect, 1);
    tex.offset.set((1 - screen / mediaAspect) / 2, 0);
  } else {
    tex.repeat.set(1, mediaAspect / screen);
    tex.offset.set(0, 1 - mediaAspect / screen);
  }
}

/* ---------- the 3D scene inside one plate ---------- */


function PartMesh({
  part,
  tex,
  aspect,
  screenOn,
  reg,
}: {
  part: Device['base'];
  tex: THREE.Texture | null;
  aspect: number;
  screenOn: RefObject<number>;
  reg: Reg;
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useEffect(() => {
    if (tex && part.screen) cover(tex, aspect, part.screen.w / part.screen.h);
  }, [tex, aspect, part.screen]);
  useFrame((state) => {
    const m = matRef.current;
    if (m) {
      m.opacity = screenOn.current ?? 1;
      m.color.setScalar(0.35 + 0.65 * (screenOn.current ?? 1));
    }
  });
  return (
    <>
      {part.fills.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={PAPER} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} toneMapped={false} />
        </mesh>
      ))}
      {part.screen && (
        <mesh geometry={part.screen.geo}>
          <meshBasicMaterial ref={matRef} map={tex} color="#ffffff" transparent toneMapped={false} />
        </mesh>
      )}
      {part.lines.length > 0 && <Line points={part.lines} segments color={INK} lineWidth={1.4} />}
      {part.detail.length > 0 && <Line points={part.detail} segments color={INK} lineWidth={1.0} transparent opacity={0.42} />}
    </>
  );
}

function DeviceScene({
  project,
  reg,
  track,
  prog,
  index,
  playing,
  reduce,
  onFirst,
  onEntered,
}: {
  project: Project;
  reg: Reg;
  track: RefObject<HTMLDivElement | null>;
  prog: RefObject<number> | null;
  index: number;
  playing: boolean;
  reduce: boolean;
  onFirst: () => void;
  onEntered: () => void;
}) {
  const dev = useMemo(() => buildDevice(project.device), [project.device]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tex = useMediaTexture(project.media, playing, videoRef);
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const screenOn = useRef(reduce ? 1 : 0);
  const look = useMemo(() => new THREE.Vector3(), []);
  const flags = useRef({ first: false, entered: false });
  const ctl = reg.ctl;

  useEffect(() => {
    reg.video = videoRef.current;
  });

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    const el = track.current;
    const g = group.current;
    const c = cam.current;
    if (!el || !g || !c) return;
    if (!flags.current.first) {
      flags.current.first = true;
      onFirst();
    }
    const vh = window.innerHeight;
    const staged = !!prog;

    // swing (0..1), hold, push (0..1)
    let swing: number;
    let push = 0;
    let drift = 0;
    if (staged) {
      const u = prog!.current * PROJECTS.length - index;
      g.visible = u > -0.01 && u < 1.01;
      if (!g.visible) return;
      swing = reduce ? 1 : p2out(clamp01(u / 0.3));
      push = reduce ? 0 : p2in(clamp01((u - 0.7) / 0.3));
    } else {
      const r = el.getBoundingClientRect();
      swing = reduce ? 1 : ease3(clamp01((vh - r.top) / (vh * 0.8)));
      drift = reduce ? 0 : (r.top + r.height / 2 - vh / 2) / vh;
    }
    if (swing >= 0.999 && !flags.current.entered) {
      flags.current.entered = true;
      onEntered();
    }

    const k = Math.min(1, dt * 4);
    ctl.x += (ctl.tx - ctl.x) * k;
    ctl.y += (ctl.ty - ctl.y) * k;
    if (!ctl.dragging) {
      // inertia after release, then a slow ease back home
      if (Math.abs(ctl.vel) > 0.0004) {
        ctl.rotY += ctl.vel * dt * 60;
        ctl.vel *= Math.exp(-dt * 3.2);
        ctl.idle = 0;
      } else {
        ctl.vel = 0;
        ctl.idle += dt;
      }
      if (ctl.idle > 1.4) {
        const back = Math.min(1, dt * 1.2);
        ctl.rotY -= ctl.rotY * back;
        ctl.rotX -= ctl.rotX * back;
      }
    }

    const tilt = reduce ? 0 : 1;
    let ry = ctl.rotY + ctl.nudge + ctl.x * 0.22 * tilt + drift * 0.25;
    let rx = ctl.rotX + ctl.y * 0.1 * tilt;
    let lift = 0;
    // every device swings in from the left: ry -0.9 to -0.2
    ry += THREE.MathUtils.lerp(-0.9, -0.2, swing);
    if (dev.kind === 'laptop') {
      if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.03, -0.24, smooth(clamp01(swing * 1.15)));
      screenOn.current = clamp01((swing - 0.6) / 0.35);
    } else if (dev.kind === 'tablet') {
      rx += -0.16 - (1 - swing) * 0.4;
      lift = (1 - swing) * -0.5;
      screenOn.current = clamp01((swing - 0.5) / 0.4);
    } else {
      lift = (1 - swing) * -0.6;
      screenOn.current = clamp01((swing - 0.5) / 0.4);
    }
    g.rotation.set(rx, ry, 0);
    g.position.y = lift;

    // frame the device: it fills about 80% of its box
    const aspect = state.size.width / Math.max(1, state.size.height);
    const tan = Math.tan(THREE.MathUtils.degToRad(c.fov / 2));
    const dW = (dev.width * (staged ? 0.95 : 1.12)) / (2 * tan * aspect);
    const dH = (staged ? 2.7 : 3.1) / (2 * tan);
    const d0 = Math.max(dW, dH);
    const dolly = staged ? THREE.MathUtils.lerp(1.7, 1, swing) * THREE.MathUtils.lerp(1, 0.78, push) : 1;
    const d = d0 * dolly;
    const cy = (dev.kind === 'tablet' ? 0 : dev.centerY) + push * 0.15;
    c.position.set(0, cy + d * 0.2, d);
    look.set(0, cy - 0.05, 0);
    c.lookAt(look);
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={28} near={0.1} far={100} />
      <group ref={group}>
        <PartMesh part={dev.base} tex={tex} aspect={project.media.aspect} screenOn={screenOn} reg={reg} />
        {dev.lid && dev.hinge && (
          <group position={dev.hinge}>
            <group ref={lid}>
              <PartMesh part={dev.lid} tex={tex} aspect={project.media.aspect} screenOn={screenOn} reg={reg} />
            </group>
          </group>
        )}
      </group>
    </>
  );
}

/* ---------- DOM plates ---------- */

function Links({ p }: { p: Project }) {
  return (
    <p className={s.plateLinks}>
      <a href={p.url} target="_blank" rel="noopener noreferrer">
        Visit {p.title} <span aria-hidden="true">↗</span>
      </a>
      {p.github && (
        <>
          {' '}
          <span className={s.dot} aria-hidden="true">
            ·
          </span>{' '}
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </>
      )}
    </p>
  );
}

/** a line drawing shown in place of a canvas until its first frame renders */
function DevicePlaceholder() {
  return (
    <svg className={s.ph} viewBox="0 0 160 100" fill="none" aria-hidden="true">
      <path d="M38 22 H122 V70 H38 Z M30 70 H130 L138 80 H22 Z" />
      <path d="M46 30 H114 V62 H46 Z" opacity="0.4" />
    </svg>
  );
}

type Shared = { dragged: boolean; setDragged: () => void };

function Plate({
  project,
  index,
  mode,
  reduce,
  touch,
  reg,
  prog,
  shared,
  active,
}: {
  project: Project;
  index: number;
  mode: Mode;
  reduce: boolean;
  touch: boolean;
  reg: Reg;
  prog: RefObject<number> | null;
  shared: Shared;
  active: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const inViewFlow = useInView(stageRef, '0px', 0.2);
  const inView = mode === 'stage' ? active : inViewFlow;
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [grab, setGrab] = useState(false);
  const isVideo = project.media.kind === 'video';
  const paused = userPaused ?? reduce;
  const playing = isVideo && inView && !paused;
  const ctl = reg.ctl;
  const down = useRef({ x: 0, y: 0, moved: false });

  const onEntered = () => {
    setGrab(true);
    // the first-view nudge: turn about 15 degrees and back, so it reads as turnable
    if (!reduce && !shared.dragged) gsap.to(ctl, { nudge: TURN, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1, delay: 0.15 });
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      ctl.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ctl.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    if (ctl.dragging) {
      const dx = e.clientX - ctl.lastX;
      const now = performance.now();
      const step = dx * 0.008;
      const frames = Math.max(1, (now - ctl.lastT) / 16.7);
      ctl.vel = ctl.vel * 0.6 + (step / frames) * 0.4;
      ctl.rotY += step;
      ctl.rotX = Math.max(-0.5, Math.min(0.5, ctl.rotX + (e.clientY - ctl.lastY) * 0.004));
      ctl.lastX = e.clientX;
      ctl.lastY = e.clientY;
      ctl.lastT = now;
      if (Math.abs(e.clientX - down.current.x) + Math.abs(e.clientY - down.current.y) > 6) down.current.moved = true;
    }
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ctl.dragging = true;
    ctl.idle = 0;
    ctl.vel = 0;
    ctl.lastX = e.clientX;
    ctl.lastY = e.clientY;
    ctl.lastT = performance.now();
    down.current = { x: e.clientX, y: e.clientY, moved: false };
    gsap.killTweensOf(ctl, 'nudge');
    ctl.rotY += ctl.nudge;
    ctl.nudge = 0;
    if (viewRef.current) viewRef.current.dataset.press = 'true';
    document.documentElement.dataset.grabbing = 'true';
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ctl.dragging) return;
    ctl.dragging = false;
    ctl.idle = 0;
    if (viewRef.current) viewRef.current.dataset.press = 'false';
    delete document.documentElement.dataset.grabbing;
    if (down.current.moved) shared.setDragged();
    else if (e.pointerType !== 'mouse' && isVideo && e.type === 'pointerup') setUserPaused(!paused); // tap the screen to pause
  };
  const onLeave = () => {
    ctl.tx = 0;
    ctl.ty = 0;
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') ctl.rotY -= 0.25;
    else if (e.key === 'ArrowRight') ctl.rotY += 0.25;
    else return;
    ctl.idle = 0;
    e.preventDefault();
  };

  const kindName = project.device === 'laptop' ? 'a laptop' : project.device === 'tablet' ? 'a tablet' : 'a monitor';
  const showHint = grab && !shared.dragged && index === 0;

  return (
    <figure className={s.plate} data-plate={index} data-in={mode === 'flow' ? '' : undefined}>
      {mode === 'stage' && (
        <span className={s.ghost} data-ghost aria-hidden="true">
          Fig. {project.fig}
        </span>
      )}
      <div
        ref={stageRef}
        className={s.stage}
        data-ready={ready ? 'true' : 'false'}
        data-grab={grab ? 'true' : 'false'}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
        onKeyDown={onKey}
        tabIndex={mode === 'stage' && !active ? -1 : 0}
        role="img"
        aria-label={`${project.title}, shown on ${kindName} drawn in ink. Use the arrow keys or drag to turn it.`}
      >
        <DevicePlaceholder />
        <View ref={viewRef} className={s.view} data-press="false">
          <DeviceScene
            project={project}
            reg={reg}
            track={stageRef}
            prog={mode === 'stage' ? prog : null}
            index={index}
            playing={playing}
            reduce={reduce}
            onFirst={() => setReady(true)}
            onEntered={onEntered}
          />
        </View>
        <span className={s.dragHint} data-on={showHint ? 'true' : 'false'} aria-hidden="true">
          <svg viewBox="0 0 40 12" fill="none">
            <path d="M2 6 H38 M6 2 L2 6 L6 10 M34 2 L38 6 L34 10" stroke="currentColor" strokeWidth="1" />
          </svg>
          {touch ? 'swipe to turn' : 'drag to turn'}
        </span>
      </div>
      <div className={s.plateText} data-text>
        <figcaption className={s.plateCap}>
          <span>
            Fig. {project.fig}. {project.title}, on {kindName}.
          </span>
          {isVideo && (
            <button
              type="button"
              className={s.playBtn}
              onClick={() => setUserPaused(!paused)}
              aria-pressed={!paused}
              aria-label={paused ? `Play ${project.title}` : `Pause ${project.title}`}
            >
              <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
              {paused ? 'Play' : 'Pause'}
            </button>
          )}
        </figcaption>
        <h3 className={s.plateTitle}>{project.title}</h3>
        {project.role && <p className={s.plateRole}>{project.role}</p>}
        <p className={s.plateDesc}>{project.description}</p>
        {project.detail && <p className={s.plateDetail}>{project.detail}</p>}
        <p className={s.plateTech}>{project.tech.join(' · ')}</p>
        <Links p={project} />
      </div>
    </figure>
  );
}

function MotionClip({ m, reduce }: { m: (typeof MOTION)[number]; reduce: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, '0px', 0.25);
  const [loaded, setLoaded] = useState(false);
  // the hatch gives way as soon as there is a picture: the poster, or the first frame
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = posterOf(m.src);
  }, [m.src]);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduce]);
  return (
    <figure className={`${s.clip} ${s[`clip_${m.key}`]}`} style={{ ['--ar' as string]: String(m.aspect) }}>
      <div className={s.clipFrame} style={{ aspectRatio: String(m.aspect) }}>
        <video
          ref={ref}
          src={m.src}
          poster={posterOf(m.src)}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${m.label}, a motion design loop`}
          controls={reduce}
          onLoadedData={() => setLoaded(true)}
        />
        <span className={s.hatch} data-loaded={loaded ? 'true' : 'false'} aria-hidden="true" />
      </div>
      <figcaption className={s.clipCap}>
        7{m.key}. {m.label}
      </figcaption>
    </figure>
  );
}

function ClearPass() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  return null;
}

export default function Figures() {
  const { mode, reduce, touch } = useMode();
  const secRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const prog = useRef(0);
  const visible = useInView(secRef, '15% 0px 15% 0px', 0);
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragged, setDraggedState] = useState(false);
  const regs = useMemo<Reg[]>(() => PROJECTS.map(() => ({ video: null, ctl: newCtl() })), []);
  useEffect(() => setMounted(true), []);

  const shared: Shared = { dragged, setDragged: () => setDraggedState(true) };

  // the pinned stage and the reel (desktop with motion only)
  useEffect(() => {
    if (mode !== 'stage') return;
    gsap.registerPlugin(ScrollTrigger);
    const stage = stageRef.current!;
    const n = PROJECTS.length;
    const plates = [...stage.querySelectorAll<HTMLElement>('[data-plate]')];
    const texts = plates.map((p) => p.querySelector<HTMLElement>('[data-text]')!);
    const ghosts = plates.map((p) => p.querySelector<HTMLElement>('[data-ghost]')!);
    let cur = -1;

    const render = () => {
      const P = prog.current * n;
      const i = Math.min(n - 1, Math.floor(P));
      const u = P - i;
      if (i !== cur) {
        cur = i;
        setActiveIdx(i);
      }
      texts.forEach((t, k) => {
        const uk = P - k;
        const vis = k === i ? smooth(clamp01((uk - 0.1) / 0.14)) * (1 - smooth(clamp01((uk - 0.8) / 0.12))) : 0;
        t.style.opacity = vis.toFixed(3);
        t.style.transform = `translate3d(0, ${((1 - vis) * 16).toFixed(1)}px, 0)`;
        t.style.visibility = vis > 0.01 ? 'visible' : 'hidden';
        const gv = k === i ? smooth(clamp01(uk / 0.25)) * (1 - smooth(clamp01((uk - 0.78) / 0.2))) : 0;
        ghosts[k].style.opacity = gv.toFixed(3);
        ghosts[k].style.transform = `translate3d(${((0.5 - uk) * 6).toFixed(2)}vw, 0, 0)`;
      });
      // a short dip at each hand-off, so one device gives way to the next
      const fade = Math.min(smooth(clamp01(u / 0.05)), i === n - 1 ? 1 : smooth(clamp01((1 - u) / 0.05)));
      if (glRef.current) glRef.current.style.opacity = fade.toFixed(3);
    };

    const ctx = gsap.context(() => {
      gsap.to(prog, {
        current: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * SEG * n}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: render,
      });

      const reel = reelRef.current!;
      const track = trackRef.current!;
      gsap.to(track, {
        x: () => -Math.max(0, track.scrollWidth - reel.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: reel,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, secRef);
    render();
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      plates.forEach((_, k) => {
        texts[k].removeAttribute('style');
        ghosts[k]?.removeAttribute('style');
      });
      if (glRef.current) glRef.current.style.opacity = '';
    };
  }, [mode, regs]);

  return (
    <div ref={secRef} className={s.figures} data-mode={mode} data-fig-hide={mode === 'stage' ? '' : undefined}>
      <div ref={stageRef} className={s.figStage}>
        {PROJECTS.map((p, i) => (
          <Plate
            key={p.title}
            project={p}
            index={i}
            mode={mode}
            reduce={reduce}
            touch={touch}
            reg={regs[i]}
            prog={prog}
            shared={shared}
            active={mode === 'stage' ? visible && i === activeIdx : false}
          />
        ))}
      </div>

      <section ref={reelRef} className={s.motion} aria-labelledby="motion-title" data-in={mode === 'flow' ? '' : undefined}>
        <h3 id="motion-title" className={s.motionTitle}>
          Fig. 7. Motion design, built in code.
        </h3>
        <div ref={trackRef} className={s.motionGrid}>
          {MOTION.map((m) => (
            <MotionClip key={m.key} m={m} reduce={reduce} />
          ))}
        </div>
        <p className={s.motionNote}>7a is Sovra, where I work. Each loop is a motion piece I built in code.</p>
      </section>

      {mounted && (
        <div ref={glRef} className={s.glWrap} data-active={visible ? 'true' : 'false'} aria-hidden="true">
          <Canvas
            className={s.gl}
            dpr={[1, 2]}
            frameloop={visible ? 'always' : 'never'}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            flat
          >
            <ClearPass />
            <View.Port />
          </Canvas>
        </div>
      )}
    </div>
  );
}
