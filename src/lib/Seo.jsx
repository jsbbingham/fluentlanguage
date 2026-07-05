import { useEffect } from 'react'
import { ORIGIN } from '../data/seo.js'

// Syncs the document head with per-route metadata. The base tags live in
// index.html; this component mutates them on navigation so every route has a
// unique title, description, canonical, and social card. The prerender step
// captures the mutated head into each route's static HTML.

const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large'
const JSONLD_ID = 'route-jsonld'

function setTag(selector, content) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute('content', content)
}

export default function Seo({ title, description, path, robots, jsonLd }) {
  useEffect(() => {
    const url = ORIGIN + (path === '/' ? '/' : path)

    document.title = title
    setTag('meta[name="description"]', description)
    setTag('meta[name="robots"]', robots || DEFAULT_ROBOTS)
    document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', url)

    setTag('meta[property="og:title"]', title)
    setTag('meta[property="og:description"]', description)
    setTag('meta[property="og:url"]', url)
    setTag('meta[name="twitter:title"]', title)
    setTag('meta[name="twitter:description"]', description)

    // Route-scoped JSON-LD (e.g. the FAQPage schema on Home). The site-wide
    // entity graph is static in index.html and untouched here.
    document.getElementById(JSONLD_ID)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = JSONLD_ID
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [title, description, path, robots, jsonLd])

  return null
}
