# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing + lead-capture site for **Isela Bingham**, a professional Spanish ↔ English interpreter/translator (Stockton, CA). Live at **https://www.fluentlanguage.net** (`www` is canonical; apex 301s to it). The audience is legal/medical/educational buyers — design and copy decisions should read as trustworthy and professional, not flashy.

## Architecture: React SPA + PHP backend (hybrid)

This is **not** a pure frontend app. Two halves ship to the same Apache docroot:

- **Frontend** — React 18 + Vite + Tailwind + Framer Motion + Lucide, built to `dist/`. Client-side routing via `react-router-dom` (`src/main.jsx`). No SSR.
- **Backend** — plain PHP in `api/` (`contact.php`, `reviews.php`, `csrf.php`, `config.php`). Email via Resend; reviews persisted as JSON files. The frontend talks to it over same-origin `fetch` to relative `api/*.php` paths.

`src/lib/api.js` is the bridge and the part most likely to trip you up: **both forms require a CSRF token.** Flow = `GET api/csrf.php` (mints token + sets PHP session cookie) → POST the form with `csrf_token` and `credentials: 'same-origin'`. `postForm()` handles minting, attaching, and one automatic retry on a stale-token response. Any new form must go through it.

Form field contracts are enforced server-side — match them exactly:
- **contact.php**: `name`, `email`, `subject` (one of `translation|interpretation|legal|medical|other`), `message` (10–5000 chars), `website` (honeypot), `csrf_token`.
- **reviews.php**: `action=submit`, `rating` (1–5), `comment` (1–2000), `email` (**required**), `name` (optional), `website` (honeypot), `csrf_token`. `GET api/reviews.php?action=list` returns the public reviews.

Server-only state lives **outside** the web root and must never be assumed present in this repo or touched by a deploy: `/home/fluentl/config/env.php` (Resend key + notify email) and `/home/fluentl/data/` (`reviews.json`, rate-limit + contact logs). `config.php` fails closed with a 500 if `env.php` is missing.

## Design system

`DESIGN_SYSTEM.md` is the source of truth ("Editorial Luxury": warm alabaster/ink, terracotta→saffron accent, jewel viridian, Fraunces + DM Sans, glassmorphism, mesh gradients). Tokens are implemented in `tailwind.config.js` and the base/component layers of `src/index.css` — **edit those two together with the doc, not ad-hoc inline styles.** Reusable primitives (`.btn-primary`, `.card`, `.chip`, `.field`, `.glass`, `.eyebrow`, `.text-gradient-accent`) live in `src/index.css`; shared motion variants in `src/lib/motion.js`; page copy/data in `src/data/site.js`. Content graphics (the hero "language bridge") are inline SVG, not images.

## Commands

```bash
npm install
npm run dev      # Vite dev server (proxies /api -> https://fluentlanguage.net, see vite.config.js)
npm run build    # -> dist/ (vite build + scripts/prerender.mjs — see SEO section)
npm run preview  # serve dist/ locally; honors SPA fallback for deep routes
```

`npm run build` includes a **prerender step** (`scripts/prerender.mjs`, playwright-core) that snapshots every route into static HTML: `dist/index.html`, `dist/<route>/index.html`, plus `dist/404.html` (the pristine shell for the ErrorDocument). It requires a Playwright Chromium in `~/.cache/ms-playwright` (present on bing03; the script globs `chromium-*/chrome-linux*/chrome`). Note that `vite preview` SPA-fallbacks `/about` to the root index.html — check `/about/` (trailing slash) to see the prerendered file locally; production Apache serves it for both forms.

There is **no test suite, linter, or typecheck** configured. "Verifying" means `npm run build` (must be warning-free — a bad Lucide import shows up as a rollup warning) plus a `preview` smoke test of routes. Local dev cannot fully exercise CSRF/CORS because the PHP session cookie is cross-origin through the proxy; real form round-trips only work same-origin in production.

## `public/` ships verbatim into `dist/` — and it matters

Vite copies everything in `public/` to the build root. That's where the production **`.htaccess`**, `robots.txt`, `sitemap.xml`, `llms.txt`, and `images/` (favicons, logo, Isela's portrait) live. The placeholder favicon was removed; assets are referenced as `/images/...`. SEO files use the SPA's clean URLs (`/about`, not `/about.html`).

### `.htaccess` gotchas (both bit us)

`public/.htaccess` carries SPA routing **and** the hardened security posture. Three non-obvious constraints:

1. **CSP `style-src` must include `'unsafe-inline'`** — React/Framer Motion render element styles as inline `style` attributes. `script-src` stays strict `'self'` (Vite emits an external module bundle, no inline scripts) — keep it that way.
2. **Order the SPA route rules after guarded redirects.** The SPA rewrite causes mod_rewrite to restart the ruleset in per-directory context, so any unguarded `index.html → /` (or `*.html → clean`) redirect re-fires and 301-loops every route back to `/`. The `.html`→clean and `index.html`→`/` redirects are guarded with `RewriteCond %{THE_REQUEST}` so they only match real client requests.
3. **No catch-all SPA fallback — use a route allowlist + `ErrorDocument 404` (avoids soft-404s).** A blanket `RewriteRule ^ index.html [L]` rewrites *every* unknown URL to `index.html` with HTTP **200**, so junk paths (and the WordPress/Yoast sitemap names crawlers probe — `sitemap_index.xml`, `news-sitemap.xml`, …) returned `200 + HTML` instead of `404`. Google flags these soft-404s and a squirrelscan audit fails `crawl/sitemap-valid`. The fix: rewrite only the **known clean routes** — now to their prerendered snapshots (`RewriteRule ^(about|reviews|contact|privacy|disclaimer)/?$ $1/index.html [L]`), let everything else fall through to a real 404, and `ErrorDocument 404 /404.html` (the pristine shell, X-Robots-Tag noindex) so 404s still render the styled SPA NotFound page (React Router has a `path: '*'` catch-all). **Trade-off:** the route list must stay in sync across `.htaccess`, `src/main.jsx`, and `scripts/prerender.mjs` — adding a page means editing all three (comments in each spot flag this). Verified live: known routes 200, unknown 404.
4. **`DirectorySlash Off` is required.** The prerender step creates real `about/`, `contact/`, … directories in the docroot, so without it mod_dir 301s `/about → /about/` *before* the allowlist rewrite runs, breaking the canonical extensionless URLs (sitemap, canonicals, and internal links all use `/about`).

## SEO / GEO layer (added 2026-07-05)

- **Per-route meta** lives in `src/data/seo.js` (`PAGE_SEO`) and is applied by `src/lib/Seo.jsx` (mutates the head tags that index.html declares). Every page renders `<Seo {...PAGE_SEO.x} />`; a new page needs an entry there too.
- **Structured data**: site-wide entity graph (ProfessionalService + Person + WebSite) is static JSON-LD in `index.html`. The Home FAQ section and its FAQPage schema both derive from `FAQS` in `src/data/site.js` — edit the answers there only, and keep them factual (no certification claims; "HIPAA-aware", not "HIPAA-certified/compliant").
- **Prerendering is the GEO backbone**: AI crawlers (GPTBot, ClaudeBot, PerplexityBot) don't execute JS; they read the static snapshots. If the prerender step is skipped, every route silently degrades to the empty shell for those crawlers.
- **Cloudflare Email Obfuscation must stay OFF** for this zone (disabled 2026-07-05 via API). With prerendered HTML it rewrote the visible email into `/cdn-cgi/l/email-protection` links whose inline decode script the strict CSP blocks — crawlers saw `[email protected]` and 7 broken links.
- **Social card**: `public/images/og-card.jpg` (1200×630) is generated by `node scripts/og-card.mjs` — re-run manually if branding/portrait changes.
- `public/llms.txt` and `public/sitemap.xml` are maintained by hand — bump `lastmod`/`Last updated` when shipping content changes.
- Baseline: squirrelscan 81/100, 0 failed checks (2026-07-05). Remaining warnings are deliberate: no CAPTCHA (honeypot+CSRF+rate-limit instead), no street address/postalCode in LocalBusiness schema (home business), framer-motion bundle size, Google Fonts in critical path.

## Deploy ("make live")

Production is Spanel shared hosting (account `fluentl`, docroot `/home/fluentl/public_html`), fronted by Cloudflare (zone `420cdc440eb2c41a50cd03f5741197a9`). Use the **`spanel-deploy`** skill, but with two deviations from its defaults:

- **Do not** use its `--exclude='.htaccess'` — this site's `.htaccess` is part of the build and must deploy.
- **Do not** let `--delete` reach `api/`. Deploy frontend with `rsync --delete --exclude='api' --exclude='.well-known' dist/ → public_html/`, and only deploy `api/` separately (or skip it — checksum-compare first; if the server's `api/*.php` already matches `repo:api/`, the backend deploy is unnecessary).

After deploy: fix ownership (`fluentl:fluentl`, files 644 / dirs 755) and **purge Cloudflare** (the cache caused stale-asset bugs historically). Verify against `https://www.fluentlanguage.net` (the apex 301s, so direct checks must hit `www`).

## Conventions

- `legacy/` is the archived pre-React static site — reference only, never served, don't wire anything to it.
- Commit directly to `main` (the repo's established workflow). **The local checkout can lag the remote** — this site is edited from multiple places, so always `git fetch` and inspect divergence before pushing or deploying.
