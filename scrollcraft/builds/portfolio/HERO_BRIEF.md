# Shared brief for the hero prototypes

Repo: /home/alex/alex/blockchain-portfolio (branch `redesign`, Next.js 15 App Router, React 19, TS, Tailwind v4).
Already installed: three 0.186, @react-three/fiber 9, @react-three/drei 10, gsap 3.15 (every plugin is free, including ScrollTrigger and SplitText), @gsap/react, framer-motion 12, playwright-core.
A dev server is ALREADY running at http://localhost:3100. Do not start another one, and do not run `next build` (it would clash with the dev server).

Read first: scrollcraft/builds/portfolio/BRIEF.md, then from /home/alex/.claude/skills/scroll-craft/references: hero-depth.md (all of it), taste.md (all of it), and the `parallax` section of devices.md.

## Scope
- Build ONE hero option at `app/heroes/<slug>/` (page.tsx plus any components or shaders in that folder). Write nothing outside that folder. Install nothing. If you think you need a package, say so in the report instead.
- A hero is the first screen plus its own scroll sequence (about 2 to 3 viewport-heights, GSAP ScrollTrigger scrubbed), ending as it resolves into a plain stub section, "Chapter 1 continues here". This is a prototype for the user to choose from, so it should look finished and premium.
- Use fonts through `next/font/google`, imported inside your folder. Do not use Orbitron or Exo 2. The root layout body has a dark background, so set your own background on your wrapper.

## Content
Alexandre El-Khoury. Blockchain & Full-Stack Developer, Paris. Currently building at Sovra (a DeFi savings platform: earn yield through Aave without touching a wallet). Background: Bachelor of Mathematics (Université de Paris), Master of Blockchain Engineering (ESGI). CV: /Alexandre_El-Khoury_CV.pdf. Email: alexkhoury@hotmail.com. Do not invent stats or numbers.

## Hard rules
- Real 3D, built in code: three/R3F/drei or custom GLSL. No paid or generated images.
- Dimensional layering is required: background, subject, foreground and atmosphere planes that move at visibly different rates. The headline sits BETWEEN planes, so something passes in front of part of it, yet it stays fully readable at the opening.
- A real semantic `<h1>` in HTML. Essential copy lives in HTML, not only in WebGL.
- No game, arcade, HUD, glitch or cyberpunk look. The user explicitly is not a gamer. No neon glow, no gradient text, no violet-to-blue gradients, no scroll cue or arrow or mouse icon, no `01 / 06` counters, and no em dashes in visible copy.
- Performance: dpr capped at [1, 2]. Pause the render loop (`frameloop="demand"` or invalidate) when the hero is offscreen. Animate only transform and opacity in the DOM.
- `prefers-reduced-motion`: show a complete static composition with no pinned scroll space.
- Art-direct mobile at 390x844 separately: crop, scale and type. No horizontal overflow.
- Subtle pointer response is fine. Never use pointer lock.

## Verify (keep it cheap: images are expensive)
Write a small playwright-core script in your folder's `lab/` subfolder (gitignored is fine). Use executablePath `/usr/bin/google-chrome`, headless, args `['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']`. Capture desktop 1440x900 at scroll 0, 33%, 66% and 100% of the hero, plus mobile 390x844 at 0. Wait about 1.5s after each scroll. Also capture console errors. Tile the shots into ONE contact sheet with ffmpeg (`tile` filter), view that sheet, fix what is wrong, then do one targeted re-check. No more than 3 sheet views in total.

## Report (under 150 words)
What you built, the files, how the layers are split, what you verified, known issues, and the absolute path of the final contact sheet.
