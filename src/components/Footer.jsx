import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import { NAV, BRAND } from '../data/site.js'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      {/* Mesh wash for warmth on the dark surface */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-ink opacity-50" aria-hidden="true" />
      <div className="container-x relative py-16">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/" className="font-display text-2xl font-semibold text-white">
              Fluent<span className="text-gradient-accent">Language</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Professional Spanish ↔ English translation and interpretation.
              Bridging language barriers with precision and care for legal,
              medical, and educational organizations across California.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-terracotta-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-terracotta-200"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {BRAND.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0" />
                {BRAND.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} FluentLanguage.net · {BRAND.person}. All
            rights reserved.
          </p>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/privacy" className="text-white/50 transition-colors hover:text-terracotta-200">
              Privacy Policy
            </Link>
            <Link to="/disclaimer" className="text-white/50 transition-colors hover:text-terracotta-200">
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
