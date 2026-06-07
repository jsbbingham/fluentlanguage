import { motion } from 'framer-motion'
import PageHeader from './PageHeader.jsx'
import { fadeUp, stagger } from '../lib/motion.js'

// Shared layout + typography primitives for the Privacy / Disclaimer pages.
// Keeps the long legal copy readable without pulling in a typography plugin.

export function LegalPage({ eyebrow, title, updated, children }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="py-16 lg:py-20">
        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          animate="visible"
          className="container-x max-w-3xl"
        >
          {updated && (
            <motion.p variants={fadeUp} className="mb-10 text-sm text-ink/50">
              Last updated: {updated}
            </motion.p>
          )}
          {children}
        </motion.div>
      </section>
    </>
  )
}

export function Lead({ children }) {
  return (
    <motion.p variants={fadeUp} className="mb-8 text-lg leading-relaxed text-ink/80">
      {children}
    </motion.p>
  )
}

export function H2({ children }) {
  return (
    <motion.h2
      variants={fadeUp}
      className="mt-10 mb-3 font-display text-2xl font-semibold text-ink"
    >
      {children}
    </motion.h2>
  )
}

export function H3({ children }) {
  return (
    <motion.h3 variants={fadeUp} className="mt-6 mb-2 text-lg font-semibold text-ink">
      {children}
    </motion.h3>
  )
}

export function P({ children }) {
  return (
    <motion.p variants={fadeUp} className="mb-4 leading-relaxed text-ink/75">
      {children}
    </motion.p>
  )
}

export function UL({ children }) {
  return (
    <motion.ul
      variants={fadeUp}
      className="mb-4 ml-1 space-y-2 text-ink/75 [&>li]:relative [&>li]:pl-6 [&>li]:leading-relaxed
                 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.6em]
                 [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full
                 [&>li]:before:bg-terracotta-400"
    >
      {children}
    </motion.ul>
  )
}
