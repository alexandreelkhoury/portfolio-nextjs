'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TitlePage from './TitlePage';
import MarginFigure from './MarginFigure';
import Folio from './Folio';
import Figures from './Figures';
import Formula from './Formula';
import { LINKS, LOCATION, NAME, SOVRA_TOC, TOOLBOX } from './content';
import s from './site.module.css';

/*
 * The site as a printed monograph in six chapters after a title page.
 * Each chapter lands on its own ground through its own wipe (data-wipe):
 *   II bleed (ink spreading from the margin figure), III turn (a page turning),
 *   IV slit (a spread opening on a vermilion rule), V flood (ink rising),
 *   Q.E.D. stamp (a square of paper pressed into the ink).
 */

type Wipe = 'bleed' | 'turn' | 'slit' | 'flood' | 'stamp';

function wipeClip(kind: Wipe, p: number, W: number, H: number, vh: number): string {
  if (p >= 0.999) return 'none';
  const e = p * p * (3 - 2 * p);
  switch (kind) {
    case 'bleed': {
      // an ink blot growing from the margin, its edge a little uneven
      const cx = W * 0.84;
      const r = e * Math.hypot(W, vh) * 1.08;
      const pts: string[] = [];
      for (let i = 0; i < 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        const wob = 1 + 0.045 * Math.sin(a * 5 + 1.3) + 0.03 * Math.sin(a * 11 + p * 4) + 0.02 * Math.sin(a * 19);
        pts.push(`${(cx + Math.cos(a) * r * wob).toFixed(1)} ${(Math.sin(a) * r * wob).toFixed(1)}`);
      }
      return `path('M ${pts.join(' L ')} Z')`;
    }
    case 'turn': {
      // a page turning from right to left; the edge leans like a lifted leaf
      const x1 = W * (1.05 - 1.5 * e);
      const x2 = x1 - W * 0.32 * Math.sin(Math.PI * Math.min(1, e * 1.1)) - W * 0.05;
      return `polygon(${x1}px 0px, ${W}px 0px, ${W}px ${H}px, 0px ${H}px, 0px ${vh}px, ${x2}px ${vh}px)`;
    }
    case 'slit': {
      const mid = vh * 0.5;
      const a = mid * (1 - e);
      const b = mid + mid * e;
      return `polygon(0px ${a}px, ${W}px ${a}px, ${W}px ${b}px, 0px ${b}px)`;
    }
    case 'flood': {
      // ink rising from the bottom of the screen with a slow wave on its surface
      const base = vh * (1 - e);
      const pts: string[] = [];
      const n = 24;
      for (let i = 0; i <= n; i++) {
        const x = (W * i) / n;
        const y = base + vh * 0.035 * (1 - e) * Math.sin(i * 0.9 + p * 7) + vh * 0.02 * (1 - e) * Math.sin(i * 2.3);
        pts.push(`${x.toFixed(1)}px ${y.toFixed(1)}px`);
      }
      return `polygon(${pts.join(', ')}, ${W}px ${H}px, 0px ${H}px)`;
    }
    case 'stamp': {
      // a square opening from where the margin figure sits: the tombstone, pressed
      const cx = W > 1099 ? W * 0.86 : W * 0.5;
      const cy = vh * 0.42;
      const h = e * Math.hypot(W, vh);
      const t = Math.max(0, cy - h);
      const l = Math.max(0, cx - h);
      const r = Math.max(0, W - cx - h);
      const b = Math.max(0, H - cy - h);
      return `inset(${t}px ${r}px ${b}px ${l}px)`;
    }
  }
}

function Intertitle({ num, title, fig, hid, className = '' }: { num: string; title: string; fig: number; hid: string; className?: string }) {
  return (
    <header className={`${s.inter} ${className}`} data-fig={fig} data-inter={fig}>
      <p className={s.interKicker} data-line>
        Chapter {num}.
      </p>
      <h2 id={hid} className={s.interTitle}>
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
    </header>
  );
}

export default function ProofSite({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // entrances: anything marked data-in or data-line gets data-shown once it is on screen
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
    root.querySelectorAll('[data-in], [data-inter]').forEach((el) => io.observe(el));

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // chapter grounds
      root.querySelectorAll<HTMLElement>('[data-wipe]').forEach((ground) => {
        const kind = ground.dataset.wipe as Wipe;
        const section = ground.parentElement!;
        const apply = (p: number) => {
          ground.style.clipPath = wipeClip(kind, p, section.clientWidth, section.clientHeight, window.innerHeight);
        };
        apply(0);
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: kind === 'slit' ? 'top 15%' : 'top 28%',
          scrub: 0.5,
          onUpdate: (st) => apply(st.progress),
          onRefresh: (st) => apply(st.progress),
        });
      });

      // IV: the vermilion rule the spread opens on
      const rule = root.querySelector<HTMLElement>('[data-slit-rule]');
      if (rule)
        gsap.fromTo(
          rule,
          { scaleX: 0, opacity: 1 },
          {
            keyframes: [
              { scaleX: 1, opacity: 1, duration: 0.45 },
              { scaleX: 1, opacity: 0, duration: 0.55 },
            ],
            ease: 'none',
            scrollTrigger: { trigger: rule.parentElement, start: 'top bottom', end: 'top 15%', scrub: 0.5 },
          },
        );

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

      // II: the two blocks lock together, then the link between them is drawn
      const lock = root.querySelector<HTMLElement>('[data-lock]');
      if (lock) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: lock, start: 'top 85%', end: 'center 45%', scrub: 0.6 } });
        tl.fromTo('[data-block="a"]', { x: -90, rotate: -2.5, opacity: 0 }, { x: 0, rotate: 0, opacity: 1, ease: 'power2.out', duration: 0.5 }, 0)
          .fromTo('[data-block="b"]', { x: 90, rotate: 2.5, opacity: 0 }, { x: 0, rotate: 0, opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.15)
          .fromTo('[data-link] path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', duration: 0.35 }, 0.6)
          .fromTo('[data-link-note]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 }, 0.85);
      }

      // III: the two tracks grow down the page as you read
      root.querySelectorAll<HTMLElement>('[data-track]').forEach((el) => {
        gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: true } });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      io.disconnect();
      mm.revert();
      window.removeEventListener('load', refresh);
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
          <span className={s.slitRule} data-slit-rule aria-hidden="true" />
          <div className={s.chIn}>
            <header className={`${s.inter} ${s.inter4}`} data-fig={4} data-inter={4}>
              <p className={s.interKicker} data-line>
                Chapter IV.
              </p>
              <h2 id="ch-4-title" className={s.interTitle4}>
                <span className={s.interWordMask}>
                  <span className={s.interWord} data-line>
                    Figures
                  </span>
                </span>
                <span className={s.fullStop} data-line aria-hidden="true">
                  .
                </span>
              </h2>
            </header>
            <div className={s.col}>
              <p className={`${s.lead} ${s.lead4}`} data-in>
                From October 2024 to September 2025 I worked freelance, as sole technical lead: architecture, development and deployment. These are the products, running.
              </p>
              <Figures />
            </div>
          </div>
        </section>

        {/* V. Present tense */}
        <section id="ch-5" className={`${s.chapter} ${s.ch5}`} aria-labelledby="ch-5-title" data-ground="dark">
          <div className={s.ground} data-wipe="flood" aria-hidden="true" />
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
          <div className={s.chIn}>
            <div className={`${s.col} ${s.colophon}`} data-fig={6} data-inter={6}>
              <h2 id="qed-title" className={s.qed} data-in>
                Q.E.D.
              </h2>
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
