// Design pass verify: desktop 4x4 sheet, mobile sheet (390x844 + 375x667), reduced-motion error/overflow pass.
// usage: node shoot-pass.mjs <tag> [d|m|r|all] [--no-sheet]
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
const out = '/tmp/claude-1000/-home-alex/0d3d4381-487f-408f-a5bf-ac82098936d5/scratchpad/shots/';
execSync(`mkdir -p ${out}`);
const tag = process.argv[2] || 'a';
const only = process.argv[3] || 'all';
const noSheet = process.argv.includes('--no-sheet');
const log = [];
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});

// a target is [selector, vh offset from the element's document top] or ['STAGE', project + u] or ['END'] or a number
const resolve = (t) => {
  const vh = innerHeight;
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  if (typeof t === 'number') return t;
  if (t[0] === 'END') return document.documentElement.scrollHeight - vh;
  if (t[0] === 'HERO') {
    const sp = document.querySelector('.pin-spacer');
    return sp ? top(sp) + sp.offsetHeight - vh * 1.2 : vh * 2;
  }
  if (t[0] === 'STAGE') {
    const st = document.querySelector('[class*="figStage"]');
    const sp = st.parentElement.classList.contains('pin-spacer') ? st.parentElement : st;
    return top(sp) + vh * 1.1 * t[1];
  }
  if (t[0] === 'REEL') {
    const st = document.querySelector('[class*="motion_"], section[aria-labelledby="motion-title"]');
    const sp = st.parentElement.classList.contains('pin-spacer') ? st.parentElement : st;
    return top(sp) + vh * 2.5 * t[1];
  }
  const el = document.querySelector(t[0]);
  return el ? top(el) + vh * t[1] : 0;
};

async function run(w, h, targets, prefix, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference',
    hasTouch: !!opts.touch,
    isMobile: !!opts.touch,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') log.push(`${prefix} ${m.type()}: ${m.text().slice(0, 220)}`);
  });
  page.on('pageerror', (e) => log.push(`${prefix} pageerror: ${e.message}`));
  await page.goto('http://localhost:3100/', { waitUntil: 'networkidle', timeout: 120000 });
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  await page.waitForTimeout(3000);
  if (!opts.touch) await page.mouse.move(w * 0.3, h * 0.5);
  const files = [];
  for (const [i, t] of targets.entries()) {
    const y = await page.evaluate(resolve, t);
    if (opts.touch || opts.reduce) {
      // native scroll in steps so scroll-driven state follows
      for (let k = 0; k < 60; k++) {
        const cur = await page.evaluate(() => scrollY);
        const d = y - cur;
        if (Math.abs(d) < 4) break;
        await page.evaluate((s) => window.scrollTo({ top: scrollY + s, behavior: 'instant' }), Math.sign(d) * Math.min(Math.abs(d), 700));
        await page.waitForTimeout(60);
      }
    } else {
      for (let k = 0; k < 120; k++) {
        const cur = await page.evaluate(() => scrollY);
        const d = y - cur;
        if (Math.abs(d) < 6) break;
        await page.mouse.wheel(0, Math.sign(d) * Math.min(Math.abs(d), 500));
        await page.waitForTimeout(70);
      }
    }
    await page.waitForTimeout(opts.wait ?? 1700);
    if (opts.shots !== false) {
      const file = `${out}${tag}-${prefix}-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path: file });
      files.push(file);
    }
    // per-position checks on mobile: interactive things under 44px, text under the fixed bars
    if (opts.touch) {
      const r = await page.evaluate(() => {
        const bad = [];
        const vh = innerHeight;
        document.querySelectorAll('button, a').forEach((el) => {
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.bottom < 0 || b.top > vh) return;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
          const inline = (el.tagName === 'A' && cs.display === 'inline') || String(el.className).includes('formulaBtn');
          if (!inline && (b.height < 43.5 || b.width < 43.5)) bad.push(`${el.tagName}:${(el.textContent || '').trim().slice(0, 20)} ${b.width.toFixed(0)}x${b.height.toFixed(0)}`);
        });
        return { bad: [...new Set(bad)].slice(0, 6), sw: document.documentElement.scrollWidth };
      });
      if (r.bad.length) log.push(`${prefix}#${i} small targets: ${r.bad.join(', ')}`);
      if (r.sw > w) log.push(`${prefix}#${i} overflow ${r.sw} > ${w}`);
    }
  }
  const ov = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('body *')].filter((el) => {
      const b = el.getBoundingClientRect();
      return b.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && b.width > 0;
    }).length;
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight / innerHeight, wide };
  });
  log.push(`${prefix} overflow: scrollWidth ${ov.sw} vs ${ov.iw}; page is ${ov.h.toFixed(1)} viewports`);
  await ctx.close();
  return files;
}

function sheet(files, cols, name, tw = 480, th = 300) {
  const n = files.length;
  const inputs = files.map((f) => `-i ${f}`).join(' ');
  const filt =
    files.map((_, i) => `[${i}:v]scale=${tw}:${th}:force_original_aspect_ratio=decrease,pad=${tw}:${th}:(ow-iw)/2:(oh-ih)/2:color=0x777777,setsar=1[v${i}]`).join(';') +
    ';' +
    files.map((_, i) => `[v${i}]`).join('') +
    `xstack=inputs=${n}:layout=${files.map((_, i) => `${(i % cols) * tw}_${Math.floor(i / cols) * th}`).join('|')}:fill=0x777777`;
  execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "${filt}" -frames:v 1 ${out}${name}`);
  console.log('sheet', `${out}${name}`);
}

const D = [
  0,
  ['HERO'],
  ['#ch-2', -0.45],
  ['#ch-2 header', 0.3],
  ['#ch-3 header', 0.35],
  ['#ch-4 header', 0.1],
  ['#ch-4 header', 0.72],
  ['STAGE', 0.15],
  ['STAGE', 0.5],
  ['STAGE', 1.5],
  ['STAGE', 2.86],
  ['REEL', 0.55],
  ['#ch-5 header', 0.4],
  ['#ch-5 [class*="toc"]', -0.3],
  ['[data-fig-hide][data-fig="6"]', 0.75],
  ['[data-fig-hide][data-fig="6"]', 1.5],
];
const M = [0, ['#ch-2 header', 0.05], ['#ch-4 header', 1.0], ['#ch-4 figure', -0.05], ['#ch-5 [class*="toc"]', -0.2], ['[data-fig-hide][data-fig="6"]', 1.5]];
const MS = [['#ch-1', 0], ['#ch-3 header', 0.05], ['#ch-4 figure:nth-of-type(2)', -0.05], ['#motion-title', -0.1], ['#ch-qed [class*="colophon"]', 0.2], ['END']];

if (only === 'all' || only === 'd') {
  const f = await run(1440, 900, D, 'd');
  if (!noSheet) sheet(f, 4, `sheet-${tag}-desktop.png`);
}
if (only === 'all' || only === 'm') {
  const a = await run(390, 844, M, 'm390', { touch: true });
  const b = await run(375, 667, MS, 'm375', { touch: true });
  if (!noSheet) sheet([...a, ...b], 6, `sheet-${tag}-mobile.png`, 260, 540);
}
if (only === 'all' || only === 'r') {
  await run(1440, 900, [['#ch-2', 0], ['#ch-4 figure', 0], ['#ch-qed', 0.5], ['END']], 'rd', { reduce: true, shots: false, wait: 600 });
  await run(390, 844, [['#ch-4 figure', 0], ['END']], 'rm', { reduce: true, touch: true, shots: false, wait: 600 });
}
await browser.close();
console.log(log.join('\n'));
