'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { setLenis } from './smooth';
import QedSquare from './QedSquare';
import TitlePage from './TitlePage';
import MarginFigure from './MarginFigure';
import Folio from './Folio';
import Figures from './Figures';
import Formula from './Formula';
import { LINKS, LOCATION, NAME, SOVRA_TOC, TOOLBOX } from './content';
import s from './site.module.css';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/*
 * The site as a printed monograph in six chapters after a title page.
 * Each chapter lands on its own ground through its own wipe (data-wipe):
 *   II bleed (ink spreading from the margin figure), III turn (a page turning),
 *   IV slit (a spread opening on one rule), V flood (ink rising),
 *   Q.E.D. stamp (a square of paper pressed into the ink).
 */

type Wipe = 'bleed' | 'turn' | 'slit' | 'flood' | 'stamp';
type Pt = [number, number];

/*
 * Each wipe is drawn in viewport coordinates: `fill` is the revealed region, `edge`
 * is the moving edge, which gets a 1px ink rule (the edge of a page turning).
 */
function wipeShape(kind: Wipe, p: number, W: number, vh: number, narrow: boolean): { fill: Pt[][]; edge: { pts: Pt[]; closed: boolean }[] } {
  const e = p * p * (3 - 2 * p);
  switch (kind) {
    case 'bleed': {
      // an ink blot growing from the margin figure, its edge a little uneven
      const cx = narrow ? W * 0.5 : W * 0.84;
      const cy = narrow ? vh * 0.3 : vh * 0.46;
      const r = e * Math.hypot(W, vh) * 1.08;
      const pts: Pt[] = [];
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const wob = 1 + 0.045 * Math.sin(a * 5 + 1.3) + 0.03 * Math.sin(a * 11 + p * 4) + 0.02 * Math.sin(a * 19);
        pts.push([cx + Math.cos(a) * r * wob, cy + Math.sin(a) * r * wob]);
      }
      return { fill: [pts], edge: [{ pts, closed: true }] };
    }
    case 'turn': {
      // a page turning from right to left; the edge leans like a lifted leaf
      const x1 = W * (1.05 - 1.5 * e);
      const x2 = x1 - W * 0.32 * Math.sin(Math.PI * Math.min(1, e * 1.1)) - W * 0.05;
      return {
        fill: [[[x1, -4], [W + 4, -4], [W + 4, vh + 4], [x2, vh + 4]]],
        edge: [{ pts: [[x1 + (x1 - x2) * 0.01, -4], [x2, vh + 4]], closed: false }],
      };
    }
    case 'slit': {
      const mid = vh * 0.5;
      const a = mid * (1 - e);
      const b = mid + mid * e;
      return {
        fill: [[[-4, a], [W + 4, a], [W + 4, b], [-4, b]]],
        edge: [
          { pts: [[-4, a], [W + 4, a]], closed: false },
          { pts: [[-4, b], [W + 4, b]], closed: false },
        ],
      };
    }
    case 'flood': {
      // ink rising from the bottom of the screen with a slow wave on its surface
      const base = vh * (1 - e);
      const wave: Pt[] = [];
      const n = 28;
      for (let i = 0; i <= n; i++) {
        const x = -4 + ((W + 8) * i) / n;
        wave.push([x, base + vh * 0.035 * (1 - e) * Math.sin(i * 0.9 + p * 7) + vh * 0.02 * (1 - e) * Math.sin(i * 2.3)]);
      }
      return { fill: [[...wave, [W + 4, vh + 4], [-4, vh + 4]]], edge: [{ pts: wave, closed: false }] };
    }
    case 'stamp': {
      // a square opening from where the margin figure sits: the tombstone, pressed
      const cx = narrow ? W * 0.5 : W * 0.86;
      const cy = vh * 0.42;
      const h = e * Math.hypot(W, vh);
      const sq: Pt[] = [[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h]];
      return { fill: [sq], edge: [{ pts: sq, closed: true }] };
    }
  }
}

const f1 = (v: number) => v.toFixed(1);
const pathOf = (pts: Pt[], dy: number, closed: boolean) => `M${pts.map(([x, y]) => `${f1(x)} ${f1(y + dy)}`).join(' L')}${closed ? ' Z' : ''}`;

function WipeEdge() {
  return (
    <svg className={s.wipeEdge} data-wipe-edge aria-hidden="true">
      <path />
    </svg>
  );
}

function Intertitle({ num, title, fig, hid, className = '' }: { num: string; title: string; fig: number; hid: string; className?: string }) {
  return (
    <header className={`${s.inter} ${className}`} data-fig={fig} data-inter={fig}>
      <div className={s.interIn}>
        <div className={s.figSlot} data-fig-slot={fig} aria-hidden="true" />
        <p className={s.interKicker} data-line>
          Chapter {num}.
        </p>
        <h2 id={hid} className={s.interTitle} data-settle>
          {title.split(' ').map((w, i) => (
            <span key={i}>
              <span className={s.interWordMask}>
                <span className={s.interWord} data-line style={{ transitionDelay: `${80 + i * 60}ms` }}>
                  {w}
                </span>
              </span>{' '}
            </span>
          ))}
        </h2>
      </div>
    </header>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
    } catch {
      const t = document.createElement('textarea');
      t.value = LINKS.email;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };
  return (
    <>
      <button type="button" className={s.qedBtn} onClick={copy}>
        {copied ? 'Copied' : 'Copy email'}
      </button>
      <span className={s.srOnly} aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </>
  );
}

export default function ProofSite({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;

    // smooth scroll: Lenis on the gsap ticker, off for reduced motion and for touch
    let lenis: Lenis | null = null;
    const lenisTick = (t: number) => lenis?.raf(t * 1000);
    if (!reduce && fine) {
      lenis = new Lenis({ lerp: 0.1, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    }

    // entrances: children stagger by their order among their siblings
    root.querySelectorAll<HTMLElement>('[data-in]').forEach((el) => {
      const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-in')) : [el];
      el.style.setProperty('--i', String(Math.max(0, sibs.indexOf(el))));
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.shown = 'true';
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    );
    const observeAll = () => root.querySelectorAll('[data-in]:not([data-shown]), [data-inter]:not([data-shown])').forEach((el) => io.observe(el));
    observeAll();
    // Figures switches layout after hydration, so pick up late [data-in] nodes too
    const mo = new MutationObserver(observeAll);
    mo.observe(root, { subtree: true, attributes: true, attributeFilter: ['data-in'], childList: true });

    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 1100px)' }, (ctx) => {
      const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
      if (!motion) return;

      // chapter grounds: top bottom to top top, then (with a sticky intertitle) 60vh more
      root.querySelectorAll<HTMLElement>('[data-wipe]').forEach((ground) => {
        const kind = ground.dataset.wipe as Wipe;
        const section = ground.parentElement!;
        const edge = section.querySelector<SVGSVGElement>('[data-wipe-edge]');
        const edgePath = edge?.querySelector('path');
        const settle = section.querySelector<HTMLElement>('[data-settle]');
        const hold = wide && !!section.querySelector('[data-inter]') && kind !== 'stamp';
        const apply = (p: number) => {
          const vh = window.innerHeight;
          const W = section.clientWidth;
          const oy = -section.getBoundingClientRect().top;
          if (p >= 0.999) {
            ground.style.clipPath = 'none';
            if (edge) edge.style.opacity = '0';
          } else if (p <= 0.001) {
            ground.style.clipPath = 'inset(0 0 100% 0)';
            if (edge) edge.style.opacity = '0';
          } else {
            const { fill, edge: lines } = wipeShape(kind, p, W, vh, !wide);
            ground.style.clipPath = `path('${fill.map((f) => pathOf(f, oy, true)).join(' ')}')`;
            if (edge && edgePath) {
              edge.style.opacity = '1';
              edge.setAttribute('viewBox', `0 0 ${W} ${vh}`);
              edge.style.transform = `translate3d(0, ${f1(oy)}px, 0)`;
              // the edge lives in viewport space; never draw it above this chapter's own top
              edge.style.clipPath = `inset(${f1(Math.max(0, -oy))}px 0 0 0)`;
              edgePath.setAttribute('d', lines.map((l) => pathOf(l.pts, 0, l.closed)).join(' '));
            }
          }
          if (settle) settle.style.transform = `scale(${(0.94 + 0.06 * clamp01((p - 0.8) / 0.2)).toFixed(4)})`;
        };
        apply(0);
        const prog = { p: 0 };
        gsap.to(prog, {
          p: 1,
          ease: 'none',
          onUpdate: () => apply(prog.p),
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: () => `+=${window.innerHeight * (hold ? 1.6 : 1)}`,
            scrub: 1.2,
            invalidateOnRefresh: true,
            onRefresh: () => apply(prog.p),
          },
        });
      });

      // IV: the vermilion full stop opens as an iris onto the stage
      const iris = root.querySelector<HTMLElement>('[data-iris]');
      if (iris) {
        const inner = iris.querySelector<HTMLElement>(`.${s.interIn}`)!;
        const dot = iris.querySelector<HTMLElement>('[data-iris-dot]')!;
        const ring = iris.querySelector<HTMLElement>('[data-iris-ring]')!;
        const open = iris.querySelector<HTMLElement>('[data-iris-open]')!;
        const st = { p: 0 };
        const draw = () => {
          const e = st.p * st.p; // power2.in
          const ir = inner.getBoundingClientRect();
          const dr = dot.getBoundingClientRect();
          const x = dr.left + dr.width / 2 - ir.left;
          const y = dr.top + dr.height * 0.72 - ir.top;
          const r = e * 1.5 * Math.max(window.innerWidth, window.innerHeight);
          const ro = Math.max(0, r - (6 + r * 0.08));
          ring.style.clipPath = `circle(${f1(r)}px at ${f1(x)}px ${f1(y)}px)`;
          open.style.clipPath = `circle(${f1(ro)}px at ${f1(x)}px ${f1(y)}px)`;
          ring.style.visibility = r > 0.5 ? 'visible' : 'hidden';
          open.style.visibility = ro > 0.5 ? 'visible' : 'hidden';
        };
        draw();
        gsap.to(st, {
          p: 1,
          ease: 'none',
          onUpdate: draw,
          scrollTrigger: {
            trigger: iris,
            start: () => `top top-=${window.innerHeight * 0.2}`,
            end: () => `+=${window.innerHeight * 1.2}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: draw,
          },
        });
      }

      // II: the two blocks lock together, then the link between them is drawn
      const lock = root.querySelector<HTMLElement>('[data-lock]');
      if (lock) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: lock, start: 'top 85%', end: 'center 45%', scrub: 0.6 } });
        tl.fromTo('[data-block="a"]', { x: -90, rotate: -2.5, opacity: 0 }, { x: 0, rotate: 0, opacity: 1, ease: 'power2.out', duration: 0.5 }, 0)
          .fromTo('[data-block="b"]', { x: 90, rotate: 2.5, opacity: 0 }, { x: 0, rotate: 0, opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.15)
          .fromTo('[data-link] path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', duration: 0.35 }, 0.6)
          .fromTo('[data-link-note]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 }, 0.85);
      }

      // III: the media column moves at its own rates
      root.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
        const sp = Number(el.dataset.speed);
        gsap.fromTo(
          el,
          { y: () => sp * window.innerHeight * 0.5 },
          {
            y: () => -sp * window.innerHeight * 0.5,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          },
        );
      });

      // III: the two tracks grow down the page as you read
      root.querySelectorAll<HTMLElement>('[data-track]').forEach((el) => {
        gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: true } });
      });

      return () => {
        root.querySelectorAll<HTMLElement>('[data-wipe]').forEach((g) => (g.style.clipPath = ''));
        root.querySelectorAll<HTMLElement>('[data-settle]').forEach((g) => (g.style.transform = ''));
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      io.disconnect();
      mo.disconnect();
      mm.revert();
      window.removeEventListener('load', refresh);
      if (lenis) {
        gsap.ticker.remove(lenisTick);
        lenis.destroy();
        setLenis(null);
      }
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <div ref={rootRef} className={`${s.root} ${className}`}>
      <a className={s.skip} href="#ch-1">
        Skip to Chapter I
      </a>
      <Folio />
      <MarginFigure />

      <main>
        <TitlePage />

        {/* I. Before the chain, there was proof */}
        <section id="ch-1" className={`${s.chapter} ${s.ch1}`} aria-label="Chapter I. Before the chain, there was proof" data-fig={0}>
          <div className={`${s.col} ${s.spread1}`}>
            <aside className={s.side1} data-in>
              <img className={s.logo} src="/images/universit%C3%A9-de-paris-logo.png" alt="Université de Paris" width={88} height={88} />
              <p className={s.meta}>
                Bachelor of Mathematics
                <br />
                Université de Paris
                <br />
                2018 to 2021
              </p>
            </aside>
            <div className={s.prose1}>
              <p className={s.lead} data-in>
                I started with proofs, not programs.
              </p>
              <p data-in>
                Three years of mathematics at Université de Paris: probability, statistics and differential calculus. They are the foundations behind cryptographic
                primitives and protocol design, and they were my first exposure to programming, through Python, C and data analysis.
              </p>
              <p data-in>
                A proof is finished only when every line follows from the one before it,{' '}
                <Formula note="every claim earns its next line">∀ε &gt; 0, ∃δ &gt; 0</Formula>. I still work that way. When something powers a product, I want to
                understand how it works from A to Z: frontend, backend, blockchain, AI, infrastructure, and the product design and marketing around them.
              </p>
              <p className={s.aside1} data-in>
                That habit is the thread through everything that follows. Each chapter rests on the one before it, the way blocks do.
              </p>
            </div>
          </div>
        </section>

        {/* II. The first block */}
        <section id="ch-2" className={`${s.chapter} ${s.ch2}`} aria-labelledby="ch-2-title">
          <div className={s.ground} data-wipe="bleed" aria-hidden="true" />
          <WipeEdge />
          <div className={s.chIn}>
            <Intertitle num="II" title="The first block." fig={1} hid="ch-2-title" className={s.inter2} />
            <div className={`${s.col} ${s.spread2}`}>
              <p className={`${s.lead} ${s.lead2}`} data-in>
                In 2022 I learned Solidity. That autumn I started my Master&apos;s as a work-study: three weeks on the job, one week at school.
              </p>
              <div className={s.lock} data-lock>
                <article className={`${s.block} ${s.blockA}`} data-block="a">
                  <header className={s.blockHead}>
                    <img className={s.logoSm} src="/images/alyra-logo.png" alt="" width={44} height={44} />
                    <span className={s.meta}>Alyra · 2022</span>
                  </header>
                  <h3 className={s.blockTitle}>Blockchain Developer Certification</h3>
                  <p>
                    Intensive 3-month program covering Ethereum and Solidity from the ground up. Built and deployed smart contracts using Hardhat, Truffle, and Foundry
                    across testnets and mainnet.
                  </p>
                </article>
                <svg className={s.link} data-link viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M10 6 V 60 H 190 V 114" pathLength={1} strokeDasharray="1" />
                </svg>
                <p className={s.linkNote} data-link-note>
                  <Formula note="change one leaf and the root changes" side="below">
                    root = H(a, b)
                  </Formula>
                </p>
                <article className={`${s.block} ${s.blockB}`} data-block="b">
                  <header className={s.blockHead}>
                    <img className={s.logoSm} src="/images/ambrosia-logo.jpeg" alt="" width={44} height={44} />
                    <span className={s.meta}>Ambrosia · Sep 2022 to Nov 2022 · work-study</span>
                  </header>
                  <h3 className={s.blockTitle}>Back-End DeFi Developer</h3>
                  <p>
                    Built APIs that pulled real-time data from DeFi protocols and automated on-chain transactions. Implemented AML/CFT compliance checks to meet
                    regulatory requirements for a financial services context.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* III. Building the chain */}
        <section id="ch-3" className={`${s.chapter} ${s.ch3}`} aria-labelledby="ch-3-title">
          <div className={s.ground} data-wipe="turn" aria-hidden="true" />
          <WipeEdge />
          <div className={s.chIn}>
            <Intertitle num="III" title="Building the chain." fig={2} hid="ch-3-title" className={s.inter3} />
            <div className={`${s.col} ${s.spread3}`} data-parallax>
              <div className={s.tracks}>
                <p className={`${s.lead} ${s.lead3}`} data-in>
                  For the next two years I kept that rhythm: three weeks shipping in production at Metav.rs, one week of theory at ESGI.
                </p>
                <article className={s.track} data-fig={2}>
                  <span className={s.trackLine} data-track aria-hidden="true" />
                  <p className={s.meta} data-in>
                    ESGI · Sep 2022 to July 2024
                  </p>
                  <h3 className={s.trackTitle} data-in>
                    Master of Blockchain Engineering
                  </h3>
                  <p data-in>
                    Two-year deep dive into blockchain engineering, covering EVM internals, ZK proofs, Solana, and Starknet. Combined with production-grade DevOps, CI/CD
                    pipelines, and advanced full-stack development.
                  </p>
                  <p className={s.trackAside} data-in>
                    Underneath most of it sits one operation, <Formula note="add two points on the curve, get a third: every signature rests on it">P + Q = R</Formula>, on a
                    curve like the one in the margin.
                  </p>
                </article>
                <article className={s.track} data-fig={3}>
                  <span className={s.trackLine} data-track aria-hidden="true" />
                  <p className={s.meta} data-in>
                    Metav.rs · Dec 2022 to Sep 2024 · work-study
                  </p>
                  <h3 className={s.trackTitle} data-in>
                    Backend Blockchain Developer
                  </h3>
                  <p data-in>
                    Owned the blockchain infrastructure behind an NFT and metaverse platform. Wrote and deployed smart contracts across multiple chains, built backend
                    analytics pipelines, and kept production systems running for a growing user base.
                  </p>
                  <p data-in>
                    Shipped production Web3 experiences for enterprise clients including Michelin and Le Bristol, and operated an in-house Ethereum RPC node (Geth).
                  </p>
                </article>
              </div>
              <div className={s.media3} aria-hidden="true">
                <div className={s.mediaPlate} data-speed="0.18">
                  <img src="/images/ESGI-logo.jpeg" alt="" width={225} height={225} />
                  <span>Plate i. ESGI</span>
                </div>
                <span className={s.word3} data-speed="0.42">
                  EVM
                </span>
                <span className={`${s.word3} ${s.word3b}`} data-speed="0.6">
                  ZK
                </span>
                <div className={`${s.mediaPlate} ${s.mediaPlateB}`} data-speed="-0.1">
                  <img src="/images/logo-metav.rs.jpg" alt="" width={150} height={150} />
                  <span>Plate ii. Metav.rs</span>
                </div>
                <span className={`${s.word3} ${s.word3c}`} data-speed="0.3">
                  Solana
                </span>
                <span className={`${s.word3} ${s.word3d}`} data-speed="-0.25">
                  Starknet
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* IV. Figures: the quiet before the peak, then the peak */}
        <section id="ch-4" className={`${s.chapter} ${s.ch4}`} aria-labelledby="ch-4-title">
          <div className={s.ground} data-wipe="slit" aria-hidden="true" />
          <WipeEdge />
          <div className={s.chIn}>
            <header className={`${s.inter} ${s.inter4}`} data-fig={4} data-inter={4} data-ret="0.5" data-iris>
              <div className={s.interIn}>
                <div className={s.figSlot} data-fig-slot={4} aria-hidden="true" />
                <p className={s.interKicker} data-line>
                  Chapter IV.
                </p>
                <h2 id="ch-4-title" className={s.interTitle4} data-settle>
                  <span className={s.interWordMask}>
                    <span className={s.interWord} data-line>
                      Figures
                    </span>
                  </span>
                  <span className={s.fullStop} data-line data-iris-dot aria-hidden="true">
                    .
                  </span>
                </h2>
                <div className={s.irisRing} data-iris-ring aria-hidden="true" />
                <div className={s.irisOpen} data-iris-open aria-hidden="true" />
              </div>
            </header>
            <div className={s.col}>
              <p className={`${s.lead} ${s.lead4}`} data-in>
                From October 2024 to September 2025 I worked freelance, as sole technical lead: architecture, development and deployment. These are the products, running.
              </p>
            </div>
            <Figures />
          </div>
        </section>

        {/* V. Present tense */}
        <section id="ch-5" className={`${s.chapter} ${s.ch5}`} aria-labelledby="ch-5-title" data-ground="dark">
          <div className={s.ground} data-wipe="flood" aria-hidden="true" />
          <WipeEdge />
          <div className={s.chIn}>
            <Intertitle num="V" title="Present tense." fig={5} hid="ch-5-title" className={s.inter5} />
            <div className={`${s.col} ${s.spread5}`}>
              <header className={s.sovraHead} data-in>
                <img src="/images/sovra-logo.svg" alt="Sovra" width={40} height={40} />
                <p className={s.meta}>
                  Sovra, Beirut · Oct 2025 to present
                  <br />
                  Full-Stack &amp; Blockchain Engineer
                </p>
              </header>
              <div className={s.prose5}>
                <p className={s.lead} data-in>
                  Sovra is a DeFi savings platform that lets retail users earn yield through Aave and Morpho without ever touching a wallet.
                </p>
                <p data-in>
                  I was the first engineer hired after the tech lead, to build it from the ground up. Users keep custody through abstracted smart wallets, sign in with
                  Google and never pay gas. I architected the account abstraction layer behind that gasless onboarding, and built the full stack, from the React Native
                  apps and the Next.js frontend to the Express APIs.
                </p>
                <p data-in>
                  Mobile, backend, blockchain: <Formula note="the mathematician's habit, applied to a product">A → Z</Formula>.
                </p>
              </div>
              <div className={s.toc} data-in>
                <p className={s.tocHead}>Contents of the work</p>
                <ol className={s.tocList}>
                  {SOVRA_TOC.map((r, i) => (
                    <li key={r.k} style={{ ['--i' as string]: i }}>
                      <span className={s.tocK}>{r.k}</span>
                      <span className={s.tocLeader} aria-hidden="true" />
                      <span className={s.tocV}>{r.v}</span>
                    </li>
                  ))}
                </ol>
                <p className={s.tocHead}>The toolbox</p>
                <ol className={s.tocList}>
                  {TOOLBOX.map((r, i) => (
                    <li key={r.k} style={{ ['--i' as string]: i + SOVRA_TOC.length }}>
                      <span className={s.tocK}>{r.k}</span>
                      <span className={s.tocLeader} aria-hidden="true" />
                      <span className={s.tocV}>{r.v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Q.E.D. */}
        <section id="ch-qed" className={`${s.chapter} ${s.chQed}`} aria-labelledby="qed-title">
          <div className={s.ground} data-wipe="stamp" aria-hidden="true" />
          <WipeEdge />
          <div className={s.chIn}>
            <QedSquare>
              <div className={`${s.col} ${s.qedHead}`}>
                <h2 id="qed-title" className={s.qed}>
                  Q.E.D.
                </h2>
                <p className={s.qedTrans}>Quod erat demonstrandum. Which was to be shown.</p>
              </div>
            </QedSquare>
            <div className={`${s.col} ${s.colophon}`}>
              <p className={s.qedLead} data-in>
                The next block is yours.
              </p>
              <p className={s.qedText} data-in>
                Write to <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>, read the{' '}
                <a href={LINKS.cv} target="_blank" rel="noopener noreferrer">
                  CV
                </a>
                , see the code on{' '}
                <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>{' '}
                or find me on{' '}
                <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                . I am based in {LOCATION}, and always interested in new challenges.
              </p>
              <p className={s.qedActions} data-in>
                <a className={s.qedBtn} href={LINKS.cv} download>
                  Download CV
                </a>
                <CopyEmail />
              </p>
              <p className={s.qedText} data-in>
                Off hours: markets, crypto news, motion design.
              </p>
              <footer className={s.colo} data-in>
                <p>
                  Colophon. Set in Instrument Serif and JetBrains Mono. Every figure on these pages is drawn in code, in ink, on paper.{' '}
                  <Formula note="which was to be demonstrated" side="left">
                    ∎
                  </Formula>
                </p>
                <p>
                  © {year} {NAME}
                </p>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
