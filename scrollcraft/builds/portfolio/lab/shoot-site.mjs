import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
const out = '/tmp/claude-1000/-home-alex/0d3d4381-487f-408f-a5bf-ac82098936d5/scratchpad/shots/';
execSync(`mkdir -p ${out}`);
const tag = process.argv[2] || 'a';
const only = process.argv[3] || 'all';
const reduce = process.argv.includes('--reduce');
const errors = [];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });

// target: [selector, fraction of viewport where the element's top should land] or a number (px)
async function run(w, h, targets, prefix) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? 'reduce' : 'no-preference', hasTouch: false });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${prefix} ${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => errors.push(`${prefix} pageerror: ${e.message}`));
  await page.goto('http://localhost:3100/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(3500);
  await page.mouse.move(w * 0.5, h * 0.5);
  const files = [];
  for (const [i, t] of targets.entries()) {
    const y = await page.evaluate((t) => {
      if (typeof t === 'number') return t;
      if (t[0] === 'END_HERO') { const sp = document.querySelector('.pin-spacer'); return sp ? sp.offsetHeight - innerHeight * 0.5 : innerHeight * 2; }
      const el = document.querySelector(t[0]);
      if (!el) return 0;
      return el.getBoundingClientRect().top + scrollY - innerHeight * t[1];
    }, t);
    // wheel toward the target in steps
    for (let k = 0; k < 80; k++) {
      const cur = await page.evaluate(() => scrollY);
      const d = y - cur;
      if (Math.abs(d) < 8) break;
      await page.mouse.wheel(0, Math.sign(d) * Math.min(Math.abs(d), 600));
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(1600);
    const file = `${out}${tag}-${prefix}-${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    files.push(file);
  }
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight / innerHeight }));
  errors.push(`${prefix} overflow: scrollWidth ${ov.sw} vs ${ov.iw}; page is ${ov.h.toFixed(1)} viewports`);
  await ctx.close();
  return files;
}
const D = [0, ['END_HERO'], ['#ch-1', 0.05], ['#ch-2', 0.55], ['[data-lock]', 0.25], ['#ch-3 [data-parallax]', 0.1], ['#ch-4 header', -0.05], ['#ch-4 figure [role=img]', 0.12], ['#ch-4 [class*=pair]', 0.1], ['#motion-title', 0.15], ['#ch-5 [data-in]', 0.15], ['#qed-title', 0.4]];
const M = [['#ch-1', 0.1], ['#ch-2 header', 0.0], ['#ch-4 figure [role=img]', 0.2]];
let files = [];
if (only === 'all' || only === 'd') files = files.concat(await run(1440, 900, D, 'd'));
if (only === 'all' || only === 'm') files = files.concat(await run(390, 844, M, 'm'));
await browser.close();
const cols = 5;
const n = files.length;
const rows = Math.ceil(n / cols);
const inputs = files.map((f) => `-i ${f}`).join(' ');
const filt = files.map((_, i) => `[${i}:v]scale=576:360:force_original_aspect_ratio=decrease,pad=576:360:(ow-iw)/2:(oh-ih)/2:color=0x777777,setsar=1[v${i}]`).join(';')
  + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${n}:layout=${files.map((_, i) => `${(i % cols) * 576}_${Math.floor(i / cols) * 360}`).join('|')}:fill=0x777777`;
execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "${filt}" -frames:v 1 ${out}sheet-${tag}.png`);
console.log('sheet', `${out}sheet-${tag}.png`);
console.log(errors.join('\n'));
