// Post-build prerender: snapshots each SPA route into static HTML so crawlers
// that don't execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, …) see the
// full page content and per-route meta from src/lib/Seo.jsx.
//
// Runs as part of `npm run build` (see package.json). Requires a Playwright
// Chromium in ~/.cache/ms-playwright (present on this build host); uses
// playwright-core so no browser download happens at install time.
//
// Output layout in dist/:
//   404.html          — pristine SPA shell (ErrorDocument target, noindex)
//   index.html        — prerendered /
//   about/index.html  — prerendered /about   (same for the other routes)

import { createServer } from 'node:http'
import { readFile, readdir, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { chromium } from 'playwright-core'

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const ROUTES = ['/', '/about', '/reviews', '/contact', '/privacy', '/disclaimer']

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.json': 'application/json', '.woff2': 'font/woff2',
}

async function findChromium() {
  const cache = join(os.homedir(), '.cache', 'ms-playwright')
  const dirs = (await readdir(cache)).filter((d) => /^chromium-\d+$/.test(d)).sort()
  for (const dir of dirs.reverse()) {
    const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((p) => join(cache, dir, p)).find(existsSync)
    if (exe) return exe
  }
  throw new Error(`No Playwright Chromium found in ${cache} — run: npx playwright install chromium`)
}

function serveDist() {
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname
    // The reviews page fetches this on mount; stub it so the snapshot shows
    // the clean empty state instead of a network error.
    if (path.startsWith('/api/reviews.php')) {
      res.writeHead(200, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ success: true, reviews: [] }))
    }
    const file = path === '/' || !extname(path) ? join(DIST, 'index.html') : join(DIST, path)
    try {
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

const { server, port } = await serveDist()
const browser = await chromium.launch({ executablePath: await findChromium() })
const page = await browser.newPage()

// Snapshot every route against the pristine shell before writing anything.
const snapshots = new Map()
for (const route of ROUTES) {
  await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200) // let entrance animations settle
  snapshots.set(route, await page.content())
  console.log(`prerendered ${route}`)
}

await browser.close()
server.close()

// Pristine shell becomes the 404 ErrorDocument, then routes are written out.
await copyFile(join(DIST, 'index.html'), join(DIST, '404.html'))
for (const [route, html] of snapshots) {
  const outFile = route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html')
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, html)
}
console.log(`prerender complete: ${ROUTES.length} routes + 404.html`)
