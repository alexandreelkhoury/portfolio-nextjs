'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, PerspectiveCamera, View } from '@react-three/drei';
import { buildDevice, type Device } from './devices';
import { MOTION, PROJECTS, type Project } from './content';
import s from './site.module.css';

/*
 * Chapter IV. Every device is drawn in the same fixed canvas through drei <View>,
 * which scissors one WebGL context into each plate's box. The canvas only runs
 * while the chapter is on screen. Videos play only while their plate is in view.
 */

const INK = '#17150f';
const PAPER = '#f6f2ea';
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => 1 - Math.pow(1 - v, 3);

type Ctl = {
  tx: number;
  ty: number;
  x: number;
  y: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  rotY: number;
  rotX: number;
  idle: number;
};
const newCtl = (): Ctl => ({ tx: 0, ty: 0, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0, rotY: 0, rotX: 0, idle: 0 });

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(mq.matches);
    const on = () => setR(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
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

/* ---------- media textures ---------- */

function useMediaTexture(media: Project['media'], playing: boolean) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let t: THREE.Texture;
    if (media.kind === 'video') {
      const v = document.createElement('video');
      v.src = media.src;
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'metadata';
      videoRef.current = v;
      t = new THREE.VideoTexture(v);
      t.colorSpace = THREE.SRGBColorSpace;
      setTex(t);
    } else {
      new THREE.TextureLoader().load(media.src, (img) => {
        if (disposed) return img.dispose();
        img.colorSpace = THREE.SRGBColorSpace;
        img.anisotropy = 4;
        t = img;
        setTex(img);
      });
    }
    return () => {
      disposed = true;
      videoRef.current?.pause();
      videoRef.current?.removeAttribute('src');
      videoRef.current?.load();
      videoRef.current = null;
      t?.dispose();
    };
  }, [media.kind, media.src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing, tex]);

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

function PartMesh({ part, tex, aspect, screenOn }: { part: Device['base']; tex: THREE.Texture | null; aspect: number; screenOn: RefObject<number> }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useEffect(() => {
    if (tex && part.screen) cover(tex, aspect, part.screen.w / part.screen.h);
  }, [tex, aspect, part.screen]);
  useFrame(() => {
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
      {part.lines.length > 0 && <Line points={part.lines} segments color={INK} lineWidth={1.25} />}
      {part.detail.length > 0 && <Line points={part.detail} segments color={INK} lineWidth={0.9} transparent opacity={0.42} />}
    </>
  );
}

function DeviceScene({
  project,
  ctl,
  track,
  playing,
  reduce,
}: {
  project: Project;
  ctl: Ctl;
  track: RefObject<HTMLDivElement | null>;
  playing: boolean;
  reduce: boolean;
}) {
  const dev = useMemo(() => buildDevice(project.device), [project.device]);
  const tex = useMediaTexture(project.media, playing);
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const screenOn = useRef(reduce ? 1 : 0);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    const el = track.current;
    const g = group.current;
    const c = cam.current;
    if (!el || !g || !c) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // entrance: 0 when the plate's top meets the bottom of the screen, 1 when it is well in
    const p = reduce ? 1 : ease(clamp01((vh - r.top) / (vh * 0.8)));
    const drift = reduce ? 0 : (r.top + r.height / 2 - vh / 2) / vh;

    const k = Math.min(1, dt * 4);
    ctl.x += (ctl.tx - ctl.x) * k;
    ctl.y += (ctl.ty - ctl.y) * k;
    if (!ctl.dragging) {
      ctl.idle += dt;
      if (ctl.idle > 1.4) {
        const back = Math.min(1, dt * 1.2);
        ctl.rotY -= ctl.rotY * back;
        ctl.rotX -= ctl.rotX * back;
      }
    }

    const tilt = reduce ? 0 : 1;
    let ry = ctl.rotY + ctl.x * 0.22 * tilt + drift * 0.25;
    let rx = ctl.rotX + ctl.y * 0.1 * tilt;
    let lift = 0;
    if (dev.kind === 'laptop') {
      ry += -0.28 + (1 - p) * 0.5;
      if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.03, -0.24, p);
      screenOn.current = clamp01((p - 0.55) / 0.35);
    } else if (dev.kind === 'tablet') {
      ry += 0.32 + (1 - p) * 1.25;
      rx += -0.16 - (1 - p) * 0.5;
      lift = (1 - p) * -0.6;
      screenOn.current = clamp01((p - 0.45) / 0.4);
    } else {
      ry += -0.22 - (1 - p) * 0.9;
      lift = (1 - p) * -0.9;
      screenOn.current = clamp01((p - 0.5) / 0.4);
    }
    g.rotation.set(rx, ry, 0);
    g.position.y = lift;

    // frame the device in the plate
    const aspect = state.size.width / Math.max(1, state.size.height);
    const tan = Math.tan(THREE.MathUtils.degToRad(c.fov / 2));
    const dW = (dev.width * 1.32) / (2 * tan * aspect);
    const dH = 3.5 / (2 * tan);
    const d = Math.max(dW, dH);
    const cy = dev.kind === 'tablet' ? 0 : dev.centerY;
    c.position.set(0, cy + d * 0.2, d);
    look.set(0, cy - 0.05, 0);
    c.lookAt(look);
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={22} near={0.1} far={100} />
      <group ref={group}>
        <PartMesh part={dev.base} tex={tex} aspect={project.media.aspect} screenOn={screenOn} />
        {dev.lid && dev.hinge && (
          <group position={dev.hinge}>
            <group ref={lid}>
              <PartMesh part={dev.lid} tex={tex} aspect={project.media.aspect} screenOn={screenOn} />
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
          <span className={s.dot} aria-hidden="true">·</span>{' '}
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </>
      )}
    </p>
  );
}

function Plate({ project, variant, reduce, hint }: { project: Project; variant: 'wide' | 'side' | 'grand' | 'pair'; reduce: boolean; hint?: boolean }) {
  const ctl = useMemo(newCtl, []);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, '0px', 0.2);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const isVideo = project.media.kind === 'video';
  const paused = userPaused ?? reduce;
  const playing = isVideo && inView && !paused;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      ctl.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ctl.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    if (ctl.dragging) {
      ctl.rotY += (e.clientX - ctl.lastX) * 0.008;
      ctl.rotX = Math.max(-0.5, Math.min(0.5, ctl.rotX + (e.clientY - ctl.lastY) * 0.004));
      ctl.lastX = e.clientX;
      ctl.lastY = e.clientY;
    }
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ctl.dragging = true;
    ctl.idle = 0;
    ctl.lastX = e.clientX;
    ctl.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onUp = () => {
    ctl.dragging = false;
    ctl.idle = 0;
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

  return (
    <figure className={`${s.plate} ${s[`plate_${variant}`]}`} data-in>
      <div
        ref={stageRef}
        className={s.stage}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
        onKeyDown={onKey}
        tabIndex={0}
        role="img"
        aria-label={`${project.title}, shown on ${kindName} drawn in ink. Use the arrow keys or drag to turn it.`}
      >
        <View className={s.view}>
          <DeviceScene project={project} ctl={ctl} track={stageRef} playing={playing} reduce={reduce} />
        </View>
      </div>
      <figcaption className={s.plateCap}>
        <span>
          Fig. {project.fig}. {project.title}, on {kindName}.{hint ? ' Drag to turn it.' : ''}
        </span>
        {isVideo && (
          <button type="button" className={s.playBtn} onClick={() => setUserPaused(!paused)} aria-pressed={!paused}>
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </figcaption>
      <div className={s.plateText}>
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
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduce]);
  return (
    <figure className={`${s.clip} ${s[`clip_${m.key}`]}`}>
      <div className={s.clipFrame} style={{ aspectRatio: String(m.aspect) }}>
        <video
          ref={ref}
          src={m.src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${m.label}, a motion design loop`}
          controls={reduce}
        />
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
  const reduce = useReduced();
  const secRef = useRef<HTMLDivElement>(null);
  const active = useInView(secRef, '15% 0px 15% 0px', 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [spl, corex, hire, tip, stamp] = PROJECTS;

  return (
    <div ref={secRef} className={s.figures}>
      <Plate project={spl} variant="wide" reduce={reduce} hint />
      <Plate project={corex} variant="side" reduce={reduce} />
      <Plate project={hire} variant="grand" reduce={reduce} />
      <div className={s.pair}>
        <Plate project={tip} variant="pair" reduce={reduce} />
        <Plate project={stamp} variant="pair" reduce={reduce} />
      </div>

      <section className={s.motion} aria-labelledby="motion-title" data-in>
        <h3 id="motion-title" className={s.motionTitle}>
          Fig. 7. Motion design, built in code.
        </h3>
        <div className={s.motionGrid}>
          {MOTION.map((m) => (
            <MotionClip key={m.key} m={m} reduce={reduce} />
          ))}
        </div>
        <p className={s.motionNote}>7a is Sovra, where I work. Each loop is a motion piece I built in code.</p>
      </section>

      {mounted && (
        <div className={s.glWrap} data-active={active ? 'true' : 'false'} aria-hidden="true">
          <Canvas
            className={s.gl}
            dpr={[1, 1.75]}
            frameloop={active ? 'always' : 'never'}
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
