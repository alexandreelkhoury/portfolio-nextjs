'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createSurfaceScene, type SceneState } from './surface';
import s from './titlepage.module.css';
import { LOCATION, NAME, TITLE } from './content';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

function Arrow({ d, head, className }: { d: string; head: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tombstone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.4 3.1 L16.8 2.6 L17.2 16.9 L2.9 17.3 Z" fill="currentColor" />
    </svg>
  );
}

export default function TitlePage() {
  const heroRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const latNoteRef = useRef<HTMLDivElement>(null);
  const interRef = useRef<HTMLDivElement>(null);
  const folioARef = useRef<HTMLSpanElement>(null);
  const folioBRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = heroRef.current!;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const st = { p: 0, intro: reduce ? 1 : 0 };
    const state: SceneState = { draw: 1, morph: 0, nodes: 0, lift: 0 };
    const getState = () => {
      const p = st.p;
      state.draw = reduce ? 1 : 0.55 * st.intro + 0.45 * clamp01(p / 0.42);
      state.morph = reduce ? 0 : smooth(clamp01((p - 0.42) / 0.32));
      state.nodes = reduce ? 0 : smooth(clamp01((p - 0.64) / 0.12));
      state.lift = reduce ? 0 : 0.62 * clamp01(p / 0.6);
      return state;
    };

    const scene = createSurfaceScene(backRef.current!, frontRef.current!, {
      reduce,
      getState,
      onReady: () => {
        backRef.current?.classList.add(s.ready);
        frontRef.current?.classList.add(s.ready);
      },
      onLayout: ({ x, y }) => {
        const n = latNoteRef.current;
        if (n) {
          n.style.left = `${x}px`;
          n.style.top = `${y}px`;
        }
      },
    });

    // run the render loop only while the hero is on screen and the tab is visible
    let inView = true;
    const sync = () => (inView && !document.hidden ? scene.start() : scene.stop());
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(hero);
    document.addEventListener('visibilitychange', sync);
    const onResize = () => scene.resize();
    window.addEventListener('resize', onResize);

    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 700px)' },
      (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        gsap.to(st, { intro: 1, duration: 2.8, ease: 'power2.out', delay: 0.3 });
        const lines = interRef.current!.querySelectorAll(`.${s.line}`);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: mobile ? '+=190%' : '+=240%',
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
          },
        });
        tl.to(st, { p: 1, duration: 1 }, 0)
          .to(gridRef.current, { y: mobile ? -36 : -56, duration: 1 }, 0)
          .to(titleRef.current, { y: mobile ? -90 : -125, duration: 0.6 }, 0)
          .to(titleRef.current, { opacity: 0, duration: 0.15 }, 0.44)
          .to(captionRef.current, { y: -60, opacity: 0, duration: 0.2 }, 0.36)
          .to(notesRef.current, { y: mobile ? -220 : -320, duration: 0.62 }, 0)
          .to(notesRef.current, { opacity: 0, duration: 0.14 }, 0.44)
          .to(folioARef.current, { opacity: 0, duration: 0.06 }, 0.64)
          .to(folioBRef.current, { opacity: 1, duration: 0.06 }, 0.68)
          .fromTo(lines, { yPercent: 112, y: 0 }, { yPercent: 0, y: 0, duration: 0.14, stagger: 0.06, ease: 'power2.out' }, 0.66)
          .fromTo(latNoteRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.12, ease: 'power1.out' }, 0.72)
          .to(latNoteRef.current, { y: -40, duration: 0.16 }, 0.84);
        return () => gsap.killTweensOf(st);
      },
    );

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', onResize);
      scene.dispose();
    };
  }, []);

  return (
    <>
      <section ref={heroRef} className={s.hero} aria-labelledby="proof-title">
        <div className={s.stage}>
          <div className={s.gridWrap} aria-hidden="true">
            <div ref={gridRef} className={s.grid} />
          </div>

          <canvas ref={backRef} className={s.canvas} aria-hidden="true" />

          <div ref={titleRef} className={s.title}>
            <h1 id="proof-title" className={s.h1}>
              <span className={s.word}>Alexandre</span> <span className={s.word}>El-Khoury</span>
            </h1>
            <p className={s.sub}>{TITLE}, {LOCATION}. Mathematician by training.</p>
          </div>

          <canvas ref={frontRef} className={`${s.canvas} ${s.front}`} aria-hidden="true" />
          <svg className={s.ph} viewBox="0 0 200 120" fill="none" aria-hidden="true">
            <path d="M20 62 C 60 20, 140 20, 180 62 C 140 100, 60 100, 20 62 Z" />
            <path d="M48 62 C 76 38, 124 38, 152 62 C 124 84, 76 84, 48 62 Z" opacity="0.5" />
          </svg>

          <div ref={notesRef} className={s.notes} aria-hidden="true">
            <div className={`${s.note} ${s.noteA}`}>
              <span>minimal, so H = 0</span>
              <Arrow
                className={s.arrowA}
                d="M140 8 C 120 30, 96 40, 70 52 S 30 78, 18 98"
                head="M14 84 L 18 99 L 31 92"
              />
            </div>
            <div className={`${s.note} ${s.noteB}`}>
              <span>Enneper, n = 2</span>
              <Arrow
                className={s.arrowB}
                d="M10 14 C 40 22, 70 30, 96 52 S 132 86, 148 92"
                head="M134 96 L 149 93 L 141 80"
              />
            </div>
            <div className={`${s.note} ${s.noteC}`}>
              <Tombstone className={s.tomb} />
              <span>q.e.d.</span>
            </div>
          </div>

          <div ref={latNoteRef} className={s.latNote} aria-hidden="true">
            <Arrow className={s.arrowL} d="M150 40 C 120 30, 80 26, 40 36 S 18 54, 12 62" head="M10 48 L 12 63 L 26 60" />
            <span>root = H(a, b)</span>
          </div>

          <div className={s.folio}>
            <span>{NAME} · {LOCATION}</span>
            <span className={s.folioSwap}>
              <span ref={folioARef}>Title page</span>
              <span ref={folioBRef} className={s.folioB}>Chapter I</span>
            </span>
          </div>

          <p ref={captionRef} className={s.caption}>
            <span>Fig. 1. Enneper surface of order two</span>
            <span>x(z) = Re(z − z⁵/5, i(z + z⁵/5), 2z³/3)</span>
          </p>
        </div>

        <div ref={interRef} className={s.inter}>
          <p className={s.mask}>
            <span className={`${s.line} ${s.kicker}`}>Chapter I.</span>
          </p>
          <h2 className={s.mask}>
            <span className={`${s.line} ${s.h2}`}>Before the chain, there was proof.</span>
          </h2>
        </div>

        <div className={s.grain} aria-hidden="true" />
      </section>

    </>
  );
}
