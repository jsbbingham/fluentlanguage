# FluentLanguage.net — Design System

**Codename:** _Editorial Luxury_
**For:** Isela Bingham — Court- & medical-certified Spanish ↔ English interpreter and translator, 20+ years, California.

---

## 0. Design Philosophy

This is not a crypto SaaS. Isela's buyers are **attorneys, hospital administrators, school districts, and government agencies** who hire her for high-stakes courtrooms and medical settings. The site must feel **premium, confident, and unmistakably trustworthy** — the visual language of a high-end law firm or a boutique consultancy, not a neon startup.

So we go _dramatic_ in **type, depth, motion, and composition** — and _disciplined_ in **color**. One confident accent, warm jewel tones, generous negative space, and a single editorial serif doing the heavy lifting. The result reads as expensive without ever reading as gimmicky.

> **Golden rule:** if an effect would make a senior litigator doubt her professionalism, it doesn't ship. Drama comes from craft, not from glow.

---

## 1. Color Palette

The palette is **warm-anchored** — alabaster and espresso instead of clinical white and pure black — so every surface feels human and considered.

### Surfaces

| Token        | Hex       | Use                                            |
| ------------ | --------- | ---------------------------------------------- |
| `alabaster`  | `#FAF6F0` | Primary light background                       |
| `linen`      | `#F2EAE0` | Alternating sections, cards on light           |
| `ink`        | `#17120D` | Deep espresso — dark sections, footer, body text |
| `ink.800`    | `#241C14` | Raised surfaces on dark                        |
| `ink.700`    | `#332720` | Hairline borders on dark                       |

### Accents

| Token             | Hex       | Use                                          |
| ----------------- | --------- | -------------------------------------------- |
| `terracotta.500`  | `#C2613D` | **Primary accent** — CTAs, links, the brand  |
| `terracotta.600/700` | `#A34C2D` / `#7E3A22` | Hover / pressed states           |
| `terracotta.100/200` | `#F5DDD0` / `#E9B89F` | Tints, soft fills, chips         |
| `saffron.400`     | `#E8A23D` | Warm gold — stars, gradient blends, highlights |
| `viridian.500`    | `#1F6E5E` | **Jewel secondary** — accents, the "trust" tone |

### Multi-layered Mesh Gradients

Depth comes from **stacked radial gradients** (mesh), never flat fills. Two canonical recipes (see `tailwind.config.js`):

- **`bg-mesh-warm`** — terracotta + saffron + viridian blobs at 18–28% opacity over `alabaster`. Used behind the hero on light.
- **`bg-mesh-ink`** — the same hues at higher saturation over `ink`. Used on the CTA band and footer.

Mesh layers carry the `animate-mesh-drift` keyframe (18s) for an almost-subliminal living-surface effect. Respect `prefers-reduced-motion`.

### Usage Ratio

Aim for **60 / 30 / 10**: 60% warm neutral surface, 30% ink/structure, **10% accent**. Accent is a spice, not a base. Never tile terracotta across large areas except the single CTA band.

---

## 2. Typography

A two-family system with a **high-contrast serif** doing the expressive work and a **geometric sans** keeping everything legible.

| Role               | Family                         | Notes                                              |
| ------------------ | ------------------------------ | -------------------------------------------------- |
| Display / Headings | **Fraunces** (variable, opsz)  | Modern Didone-adjacent serif. Optical sizing on, soft → wonky off. High drama at large sizes. |
| Body / UI          | **DM Sans**                    | Hyper-legible geometric sans for paragraphs, nav, buttons, forms. |

### Type Scale (fluid, clamp-based)

| Token          | Clamp                          | Use                         |
| -------------- | ------------------------------ | --------------------------- |
| `display-lg`   | `clamp(3.25rem, 8vw, 6rem)`    | Hero H1                     |
| `display-md`   | `clamp(2.75rem, 6vw, 4.5rem)`  | Section openers             |
| `display-sm`   | `clamp(2.25rem, 4vw, 3rem)`    | Page headers                |
| `text-xl/2xl`  | Tailwind defaults              | Lead paragraphs             |
| `text-base`    | 16px / 1.6                     | Body — never below 16px     |

### Rules

- **Headings:** Fraunces, weight 500–700, **negative tracking** (`-0.02em` to `-0.03em`) at display sizes for that tight editorial set.
- **Contrast pairing:** big serif headline → small, uppercase, wide-tracked DM Sans eyebrow above it. This high/low contrast is the signature move.
- **Body:** DM Sans, 16px minimum, line-height 1.6–1.7, max line length ~68ch.
- **Italic Fraunces** is reserved for a single emphasized word in a headline (e.g. _precisión_) — used sparingly for warmth.

---

## 3. Visual Accents

### 1px Borders (hairlines)

- Light surfaces: `border-ink/8` to `border-ink/12` (≈ `rgba(23,18,13,0.08–0.12)`).
- Dark surfaces: `border-white/10`.
- **Always 1px, always low-opacity.** Hairlines define structure without weight. Pair with `shadow-inner-hairline` on glass for a lit top edge.

### Glassmorphism

- Surface: `bg-white/60` (light) or `bg-white/5` (on ink) + `backdrop-blur-xl` + a hairline border.
- Reserved for **floating** elements: nav on scroll, hero credibility cards, stat pills. Never for large content blocks (kills legibility).

### Elevation (shadows)

Warm-tinted, never pure black. Three tiers:

| Token           | Use                                  |
| --------------- | ------------------------------------ |
| `shadow-soft`   | Resting cards                        |
| `shadow-elevated` | Hover lift, floating cards         |
| `shadow-float`  | Hero cards, modals                   |
| `shadow-glow`   | Primary CTA hover (accent-tinted)    |

### Micro-interactions

- **Default transition:** `transition-all duration-300 ease-out` (we use `ease-out-expo` = `cubic-bezier(0.16,1,0.3,1)` for the premium decel).
- **Hover lift:** `-translate-y-1` + shadow step-up. Buttons and cards only.
- **Never** bounce, never `duration < 150ms` (feels cheap), never `> 500ms` on interaction feedback (feels sluggish).

### Geometric Accents

- Inline **SVG** for all complex background graphics (mesh blobs, contour lines, the hero's flowing language-bridge motif) — crisp at any DPI, animatable, zero image requests.
- Thin geometric line-work (1–1.5px strokes) at low opacity for texture; never heavy illustration.

---

## 4. Motion (Framer Motion)

| Pattern             | Spec                                                                 |
| ------------------- | ------------------------------------------------------------------- |
| Entrance (scroll)   | `whileInView` fade + rise 24px, `ease-out-expo`, **staggered** children 60–90ms apart. `viewport={{ once: true, margin: '-80px' }}`. |
| Hero load           | Sequenced reveal: eyebrow → headline (per-line) → subtitle → CTAs → cards. |
| Kinetic background  | Mesh blobs drift on an 18s loop; subtle parallax on scroll.         |
| Hover               | Spring `{ stiffness: 300, damping: 24 }` for lifts.                  |
| Reduced motion      | All of the above collapse to instant/opacity-only under `prefers-reduced-motion`. |

**Principle:** motion guides the eye and signals quality. It never blocks reading or delays interaction.

---

## 5. Layout

- **Container:** max-width `1200px`, 24px gutters (16px on mobile).
- **Hero:** asymmetrical — editorial headline column + a **bento cluster** of glass credibility/stat cards. Inline-SVG kinetic background.
- **Services:** **bento grid** — deliberately uneven tile sizes (one feature tile spanning 2 cols) instead of four identical boxes.
- **Rhythm:** alternate `alabaster` / `linen` sections; one `ink` mesh band for the CTA to create a dramatic dark beat.
- **Spacing:** 8px base scale. Section padding 96–128px desktop / 64px mobile. Be generous — whitespace _is_ the luxury.

---

## 6. Component Conventions

- **Buttons:** 48px height, `rounded-xl`. Primary = `gradient-accent` fill + `shadow-glow` on hover. Secondary = hairline border + glass.
- **Cards:** `rounded-2xl`, hairline border, `shadow-soft` → `shadow-elevated` on hover, `-translate-y-1`.
- **Chips/pills:** glass, hairline, icon + label, `rounded-full`.
- **Forms:** generous 14px padding, hairline border, accent focus ring (`ring-2 ring-terracotta/40`), `rounded-xl`.
- **Icons:** **Lucide React**, 1.5–2px stroke, sized to the type they sit beside. Never emoji in the new system (emoji read as informal).

---

## 7. Accessibility & Performance

- Color contrast ≥ 4.5:1 for body text; the warm neutrals are tuned to pass on `ink`.
- All motion gated on `prefers-reduced-motion`.
- Focus-visible rings on every interactive element.
- Fonts: `display=swap`, preconnect. SVG over raster. Lazy-mount below-fold motion.

---

_Tokens implemented in `tailwind.config.js`; global base styles in `src/index.css`. This document is the source of truth — update both together._
