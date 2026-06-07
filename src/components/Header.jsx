import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { NAV } from '../data/site.js'

function Logo({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="font-display text-2xl font-semibold tracking-tight text-ink"
    >
      Fluent<span className="text-gradient-accent">Language</span>
    </Link>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }) =>
    [
      'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
      isActive ? 'text-terracotta-600' : 'text-ink/70 hover:text-ink',
    ].join(' ')

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300 ease-out-expo',
        scrolled
          ? 'border-b border-ink/10 bg-alabaster/80 backdrop-blur-xl shadow-soft'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <nav className="container-x flex h-[72px] items-center justify-between">
        <Logo onClick={() => setOpen(false)} />

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-accent"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="ml-2">
            <Link to="/contact" className="btn-primary h-10 px-5 text-sm">
              Get a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
        </ul>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink/10 bg-white/50 text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden"
          >
            <ul className="container-x flex flex-col gap-1 border-t border-ink/10 bg-alabaster/95 pb-5 pt-3 backdrop-blur-xl">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-terracotta-50 text-terracotta-600'
                          : 'text-ink/80 hover:bg-linen',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 px-1">
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Get a Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
