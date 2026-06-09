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
npm run build    # -> dist/
npm run preview  # serve dist/ locally; honors SPA fallback for deep routes
```

There is **no test suite, linter, or typecheck** configured. "Verifying" means `npm run build` (must be warning-free — a bad Lucide import shows up as a rollup warning) plus a `preview` smoke test of routes. Local dev cannot fully exercise CSRF/CORS because the PHP session cookie is cross-origin through the proxy; real form round-trips only work same-origin in production.

## `public/` ships verbatim into `dist/` — and it matters

Vite copies everything in `public/` to the build root. That's where the production **`.htaccess`**, `robots.txt`, `sitemap.xml`, `llms.txt`, and `images/` (favicons, logo, Isela's portrait) live. The placeholder favicon was removed; assets are referenced as `/images/...`. SEO files use the SPA's clean URLs (`/about`, not `/about.html`).

### `.htaccess` gotchas (both bit us)

`public/.htaccess` carries SPA routing **and** the hardened security posture. Two non-obvious constraints:

1. **CSP `style-src` must include `'unsafe-inline'`** — React/Framer Motion render element styles as inline `style` attributes. `script-src` stays strict `'self'` (Vite emits an external module bundle, no inline scripts) — keep it that way.
2. **Order the SPA fallback after guarded redirects.** The fallback `RewriteRule ^ index.html [L]` causes mod_rewrite to restart the ruleset in per-directory context, so any unguarded `index.html → /` (or `*.html → clean`) redirect re-fires and 301-loops every route back to `/`. The `.html`→clean and `index.html`→`/` redirects are guarded with `RewriteCond %{THE_REQUEST}` so they only match real client requests.

## Deploy ("make live")

Production is Spanel shared hosting (account `fluentl`, docroot `/home/fluentl/public_html`), fronted by Cloudflare (zone `420cdc440eb2c41a50cd03f5741197a9`). Use the **`spanel-deploy`** skill, but with two deviations from its defaults:

- **Do not** use its `--exclude='.htaccess'` — this site's `.htaccess` is part of the build and must deploy.
- **Do not** let `--delete` reach `api/`. Deploy frontend with `rsync --delete --exclude='api' --exclude='.well-known' dist/ → public_html/`, and only deploy `api/` separately (or skip it — checksum-compare first; if the server's `api/*.php` already matches `repo:api/`, the backend deploy is unnecessary).

After deploy: fix ownership (`fluentl:fluentl`, files 644 / dirs 755) and **purge Cloudflare** (the cache caused stale-asset bugs historically). Verify against `https://www.fluentlanguage.net` (the apex 301s, so direct checks must hit `www`).

## Conventions

- `legacy/` is the archived pre-React static site — reference only, never served, don't wire anything to it.
- Commit directly to `main` (the repo's established workflow). **The local checkout can lag the remote** — this site is edited from multiple places, so always `git fetch` and inspect divergence before pushing or deploying.
