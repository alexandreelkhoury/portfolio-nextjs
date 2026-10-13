# Design pass: approved changes (the user said "yes apply" to rows 1-17)

Repo /home/alex/alex/blockchain-portfolio, branch `redesign` (checkpoint commit c5f0eb4). Code: app/components/proof/. Spec: BRIEF.md in this folder; HERO_BRIEF.md has the hard rules and the verify method. The dev server is running at http://localhost:3100. Do not run `next build`. `lenis` is installed. Keep all copy as it is now: the user has corrected many facts, so do not rewrite any.

1. **Figures becomes one pinned stage** (ScrollTrigger pin, about 110vh per project, scrub 0.8). Devices fill about 80% of the stage: in Figures.tsx the framing factor goes from `dev.width*1.32` to about `0.95`, fov to about 28, dH from 3.5 to about 2.7. Each project gets a camera move: 0-30% swing in (ry -0.9 to -0.2, dolly d*1.7 to d, power2.out), 30-70% hold with the screen on, 70-100% push in to d*0.78 and lift cy +0.15 (power2.in) as the hand-off to the next device.
2. **Video lift-off:** during the hold, the screen media FLIPs out to a DOM video at about 68vw (16:9, 1px ink border, expo.out, 0.9s), then returns before the hand-off.
3. Plate titles at clamp(3rem, 5.5vw, 6.5rem), bottom-left of the pinned stage, text column 28ch. A ghost "Fig. n" behind the device at 22vw in var(--rule).
4. **Motion work becomes a pinned horizontal reel:** x-translate over +=250%, each clip 62vh tall, gap 6vw, ease none.
5. **Margin figure:** `--fr` becomes clamp(300px, 26vw, 440px), the geometry fills about 85% of its canvas, and the linewidth goes from 1.3 to 1.8 at opacity 1. Device ink lines 1.4/1.0 at dpr [1,2].
6. **The figure takes centre stage at each intertitle:** `.inter` becomes 180vh with a sticky inner block. The figure FLIPs to the centre at about 72vmin behind the title (power3.inOut), morphs to the next chapter's shape while it is big, then returns to the margin. On mobile, the figure sits inline at each chapter start (position relative) instead of fixed.
7. **Chapter wipes:** run from `top bottom` to `top top`, plus a 60vh pin, scrub 1.2, with a 1px ink rule on the moving edge (a page turning). The title settles from scale .94 to 1 over the last 20%.
8. **Iris before the peak:** the vermilion full stop of "Figures." grows as clip-path circle 0 to 150vmax over 120vh (power2.in) and opens onto the stage. `.interTitle4` and `.qed` go to clamp(4rem, 1rem + 11vw, 13rem), letter-spacing -0.03em.
9. **Ending loop:** at Q.E.D., the ∎ grows to 90vmin over about 150vh. Inside it, the title page's Enneper surface redraws, captioned "Fig. 1, again." Q.E.D. stays, with a small translation under it: "Quod erat demonstrandum. Which was to be shown."
10. A "CV · Contact" running head stays visible at the top right (mono, small). In Q.E.D., add a Download CV button and a Copy email button, with a "Copied" confirmation in aria-live.
11. **Drag affordance:** each device auto-turns about 15° and back on first view. Show the grab cursor only after the entrance finishes, and grabbing on body while dragging. Press scales to 0.985. Release keeps its momentum (inertia) and eases back. Show a small ink "drag to turn" hint that fades after the first drag ("swipe" on touch).
12. **Lenis smooth scroll:** lerp 0.1, driven by gsap.ticker, synced with ScrollTrigger.update. Off for prefers-reduced-motion and off on touch devices. The folio nav uses lenis.scrollTo.
13. **Posters:** every video gets a poster (extract frame 1 with ffmpeg into public/media/posters/*.jpg) plus an ink-hatch placeholder that fades out over 300ms on loadeddata. Show an SVG line placeholder for each canvas until the first frame renders.
14. `--verm` goes from #c8401e to #b0361a.
15. One mono label token, `--t-mono: 12.5px` with letter-spacing 0.02em (10px labels become 11.5px on mobile). Entrances stagger children at `--i*60ms`, with 12px travel over 0.7s. Shadows are layered: `0 1px 1px rgba(40,30,10,.12), 0 18px 36px -24px rgba(40,30,10,.4)`. Image `outline: 1px solid rgba(23,21,15,.1); outline-offset:-1px` replaces the borders. Link hover moves text-underline-offset from .18em to .24em.
16. **Mobile:** the folio bar is at least 44px tall, with a paper background at 85% plus backdrop blur, safe-area inset, and bottom padding on the page so it never covers text. The Pause button has a hit area of at least 44px with a ▶/❚❚ glyph, and tapping the screen also toggles it.
17. **Desktop folio:** hover underline and a hairline leader to the active entry, plus a thin ink progress bar for the current chapter.

Rejected (do not build): "mine the block" animation, ink-nib cursor. Deferred: the margin laptop flying into the stage, collapsing the Sovra list on mobile.

Keep the taste rules: transform and opacity only (clip-path for wipes), reduced motion has no pins and stays complete, and there is no horizontal overflow.

## Verify
Use mouse.wheel stepping (Lenis needs wheel events). Make one desktop contact sheet of 16 positions (4x4) and one mobile sheet of 6, plus a reduced-motion pass that only checks for errors and overflow. View at most 3 sheets in total. Hide the Next dev badge before shooting (`nextjs-portal { display:none }`). `npx tsc --noEmit` must pass. Then `git commit` on `redesign` with a message listing the changes, ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Report in under 200 words: what changed, what you verified, the sheet paths, and known issues.
