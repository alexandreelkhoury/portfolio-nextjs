# BRIEF: Alexandre El-Khoury portfolio redesign

**Self-authored under explicit creative delegation.** The user said: "use your judgement".

## Constraints the user stated (verbatim, from 2026-10-13)

- "I want to update everything, not the content, obviously where i worked at and where i studied didnt change"
- "maybe add some framer motion video i ve built"
- "i want it to be 3D, use gsap"
- "rechange the whole structure, should be really original! shouldnt be like a normal portfolio"
- "should take the user on an adventure, and the user should be happy scrolling through my website, he should say 'i wish this portfolio has no end because its nice to see'"
- "dont do it game or arcade feel, i am not a gamer"
- "dont pay for 3D scenes! use existing libraries, free components or create a custom one"
- "do multiple hero sections i can choose from before doing the whole site"

## Fixed content (evidence, from app/data/*.js)

- Timeline: Sovra (Oct 2025 to now), Freelance (2024-25), Metav.rs (2022-24), Ambrosia (2022), ESGI Master (2022-24), Alyra (2022), Bachelor of Mathematics, Université de Paris (2018-21).
- Projects: SPL Token Launcher, CoreX, HireWise, TipMe, Stamply.
- CV PDF, Paris, Blockchain & Full-Stack Developer.
- Videos (ORBIT Studio renders, user-built): spl-hero, sovra, corex-getting-started, pithly, asklex, yelo, at ~/Desktop/orbit-studio/site/public/media/.

## The eight topics (authored decisions)

1. **Vibe:** precise, luminous, patient, a little mysterious. References: *Arrival* (2016) for its quiet scale, Ryoji Ikeda's *data.tron* for its exactness, and the Swiss topographic map for its legibility.
2. **Journey:** origin (a mathematician) → first block (Alyra, Ambrosia) → building the chain (Metav.rs, ESGI) → shipping alone (freelance products) → present (Sovra) → the next block, which is the visitor's.
3. **Energy:** calm open, a build-up through the career, intense at the projects (the videos play), then calm and certain at the close.
4. **Feeling and peak:** curiosity → recognition ("it's literally a chain") → momentum → delight at the work → invitation. The peak is the moment the visitor sees the work move inside the 3D world.
5. **The thing no site does:** the career is built the way its subject is built. Every chapter is real, hashed and linked to the one before it.
6. **Range:** editorial-precise, not premium-minimal and not cyber-neon. No gamer aesthetic, no arcade HUDs, no glitch.
7. **World:** decided by the hero the user picks (see hero options below). Each option implies a different grammar.
8. **Assets:** the existing logos, project screenshots and ORBIT videos. Everything 3D is code-generated (three.js / R3F / drei / custom shaders). No paid generation.

## Hero options (to be chosen before the full site is built)

| Option | Grammar | World | Hero device |
|---|---|---|---|
| A. Genesis | Continuous world | Dark void, glass blocks chained by light | A refractive glass block (block 0) with the name refracted behind it; scroll pulls back and reveals the chain |
| B. Proof | Chaptered editorial | Warm paper, ink line geometry | A title page; a 3D parametric surface draws itself in ink as you scroll (math → cryptography) |
| C. Liquidity | Gallery / catalog | Liquid chrome in a soft studio | A mercury pool shader that the pointer disturbs; scroll splits it into droplets that become the projects |

## Feeling curve (draft, finalised after the hero choice)

1. Open: curiosity. Caused by an object that is clearly 3D and clearly made of something, plus a name.
2. Origin: calm. Caused by the mathematics chapter, which is slow, quiet and typographic.
3. Chain: recognition. Caused by each role locking onto the last.
4. Work: delight (**PEAK**). Caused by the videos playing inside the world, with the most scroll room.
5. Close: invitation. Caused by the next block waiting, unmined, for the visitor.

**Peak sentence:** "His projects are actually playing inside the 3D thing as you scroll past them."
**Tell-someone:** "It's the site where his career is a chain you scroll along, and the last block is yours."

---

## DECISIONS AFTER HERO REVIEW (2026-10-13)

- User picked **B. Proof** ("i like B"). Genesis rejected. Liquidity: liked, but the user did not understand it, so the chrome is dropped. Its tactility is kept, redrawn in ink, for the projects.
- **Title, verbatim user constraint:** no "product" and no "protocol engineer". "my positions were developer/software engineer/blockchain engineer". Use **Software & Blockchain Engineer**.
- **Who he is, user's words:** "i like touching at product design and even marketing, i like to understand how it works from A to Z ... finance trading, crypto news, recently 3D and motion videos ... at sovra i do mobile backend blockchain". The site's thesis is understanding things from first principles to the end, which is the mathematician's habit.

## Grammar: chaptered editorial
The other grammars lost for these reasons. Filmic is the default drift. Continuous world went with Genesis, which was rejected. Live surface: he is not a single tool. Poster: too thin for seven years of story. Gallery: the career is an argument, not just a range. Split stage: nothing to compare. Cutlist: wrong energy.
Deviation, accepted by the user: the title page is centred (approved as built).

## Signature move: "the figure that keeps proving itself"
ONE ink drawing persists in the margin for the whole page and re-forms per chapter: Enneper surface (maths) → Merkle tree (first block) → elliptic curve over a lattice (cryptography, ESGI) → multi-chain graph (Metav.rs) → device wireframes (figures) → network of everything (Sovra) → the ∎ square (close). Scroll redraws it, and the line count is preserved, so it morphs instead of crossfading.

## Feeling curve and score (7 chapters, about 17vh, outside the 13.6-13.8 band)
| # | Chapter | Feeling | Cause / device |
|---|---|---|---|
| 0 | Title page | curiosity | The surface draws itself over the name (built: app/heroes/proof) |
| I | Before the chain, there was proof. Université de Paris, maths 2018-21 | calm | Intertitle, then a quiet spread: flow + in, prose, a formula in the margin |
| II | The first block. Alyra 2022, Ambrosia 2022 | recognition | Hard-cut reveal to a new ground; the margin figure locks into a Merkle tree |
| III | Building the chain. Metav.rs 2022-24, ESGI Master 2022-24 | momentum | Parallax media column of real logos; the figure becomes a multi-chain graph |
| IV | Figures. SPL Token Launcher, CoreX, HireWise, TipMe, Stamply, then motion work | **delight (PEAK, largest span about 5vh)** | Ink-line 3D device frames (laptop/phone wireframes) with the real video or screenshot playing on the screen, each captioned "Fig. n"; pointer tilts them, drag rotates them |
| V | Present tense. Sovra, Oct 2025 to now: mobile, backend, blockchain, A to Z | confidence | Dense two-column spread, what he touches listed like a table of contents |
| ∎ | Q.E.D. | resolve and warmth | Colophon: small type, contact as running text (CV, email, GitHub, LinkedIn), "Off hours: markets, crypto news, motion design." |

Peak sentence: "His projects are playing inside little ink drawings of laptops, and you can spin them."
Authored silence: one full-stop intertitle before IV (the quiet before the peak).

## Facts corrected by the user (verbatim)
- "sovra is in lebanon Beirut!": Sovra is based in Beirut, Lebanon. Write "Sovra, Beirut". The personal location line is pending the user's answer; keep "Paris" in one easily edited constant.
- "I have bachelor in math, masters in blockchain engineering": Bachelor of Mathematics (Université de Paris), Master of Blockchain Engineering (ESGI). Use these exact degree names.
- User, verbatim: "kill genesis, keep liquidity because its cool and may use it later!" Genesis is deleted. Keep app/heroes/liquidity intact.
- User, verbatim: "Aave integration now morpho as well" and "i was working at metav.rs and ambrosia while doing my master, it was an alternance, 3 weeks work 1 week study". Copy updated to match.
- User: Sovra backend is Express, not NestJS. Add React Native (the "most important one"). Toolbox blockchain list: Solana, EVM, Bitcoin, Uniswap, CCTP and more. New Sovra logo: file pending.
- User: backend has no NestJS and no MongoDB. They use MariaDB, with AWS as infra.
- User: "i live in beirut, and sovra is in beirut as well". LOCATION is now Beirut. This overrides the earlier "Paris".
- User: "use the new video of coreX". Now uses /media/corex-loop.mp4 (ORBIT corex v2, 2026-10-13).
- User: use the new HireWise video. Now /media/hirewise-loop.mp4 (a 6s cut from ORBIT hirewise-v2, starting at 0.8s).
- New Sovra logo: the yellow brush mark from https://sovra.finance/icon.svg, saved over public/images/sovra-logo.svg.
