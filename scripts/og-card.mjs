// One-off generator for the 1200x630 social share card (public/images/og-card.jpg).
// Re-run manually if the branding or portrait changes:  node scripts/og-card.mjs
// Uses the same Editorial Luxury tokens as tailwind.config.js.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { chromium } from 'playwright-core'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORTRAIT = join(ROOT, 'public', 'images', 'isela-bingham.jpg')
const OUT = join(ROOT, 'public', 'images', 'og-card.jpg')

async function findChromium() {
  const cache = join(os.homedir(), '.cache', 'ms-playwright')
  const dirs = (await readdir(cache)).filter((d) => /^chromium-\d+$/.test(d)).sort()
  for (const dir of dirs.reverse()) {
    const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((p) => join(cache, dir, p)).find(existsSync)
    if (exe) return exe
  }
  throw new Error('No Playwright Chromium found')
}

// Data URI: file:// subresources are blocked on pages loaded via setContent.
const portraitData = `data:image/jpeg;base64,${(await readFile(PORTRAIT)).toString('base64')}`

const html = `<!DOCTYPE html>
<html><head>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #FAF6F0; font-family: 'DM Sans', sans-serif; overflow: hidden; position: relative; }
  .mesh { position: absolute; inset: 0;
    background:
      radial-gradient(560px 420px at 88% -10%, rgba(194,97,61,.16), transparent 70%),
      radial-gradient(500px 400px at -6% 110%, rgba(31,110,94,.13), transparent 70%),
      radial-gradient(420px 300px at 55% 115%, rgba(232,162,61,.12), transparent 70%); }
  .card { position: absolute; inset: 0; display: flex; align-items: center; padding: 0 84px; gap: 64px; }
  .text { flex: 1; }
  .eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600;
    letter-spacing: .18em; text-transform: uppercase; color: #1F6E5E; }
  .eyebrow::before { content: ''; width: 36px; height: 2px; background: linear-gradient(90deg, #C2613D, #E8A23D); }
  h1 { font-family: 'Fraunces', serif; font-size: 74px; font-weight: 600; line-height: 1.04;
    color: #17120D; margin-top: 26px; letter-spacing: -0.01em; }
  .arrow { background: linear-gradient(90deg, #C2613D, #E8A23D); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .sub { margin-top: 26px; font-size: 27px; line-height: 1.45; color: rgba(23,18,13,.68); max-width: 620px; }
  .loc { margin-top: 34px; display: flex; align-items: center; gap: 12px; font-size: 21px; font-weight: 500; color: rgba(23,18,13,.55); }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: #C2613D; }
  .portrait { width: 316px; height: 424px; border-radius: 32px; overflow: hidden; flex-shrink: 0;
    box-shadow: 0 32px 64px -16px rgba(23,18,13,.28); border: 1px solid rgba(23,18,13,.08); position: relative; }
  .portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 62%; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: linear-gradient(90deg, #C2613D, #E8A23D); }
</style></head>
<body>
  <div class="mesh"></div>
  <div class="card">
    <div class="text">
      <span class="eyebrow">Professional Translation &amp; Interpretation</span>
      <h1>Isela Bingham</h1>
      <p class="sub">Spanish <span class="arrow">&#8596;</span> English interpreter &amp; document translator — legal, medical, and educational settings.</p>
      <div class="loc"><span class="dot"></span> Stockton, California &nbsp;·&nbsp; 20+ years of experience</div>
    </div>
    <div class="portrait"><img src="${portraitData}" alt=""></div>
  </div>
  <div class="bar"></div>
</body></html>`

const browser = await chromium.launch({ executablePath: await findChromium() })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.waitForTimeout(600) // font settle
const jpg = await page.screenshot({ type: 'jpeg', quality: 90 })
await browser.close()
await writeFile(OUT, jpg)
console.log(`wrote ${OUT} (${(jpg.length / 1024).toFixed(0)} KB)`)
