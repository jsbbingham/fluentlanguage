import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../lib/motion.js'

// Compact, dramatic inner-page header with a mesh wash + hairline base.
export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-ink/10">
      <div className="pointer-events-none absolute inset-0 bg-mesh-warm opacity-70" aria-hidden="true" />
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="visible"
        className="container-x relative py-20 text-center lg:py-24"
      >
        {eyebrow && (
          <motion.span variants={fadeUp} className="eyebrow justify-center">
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          variants={fadeUp}
          className="mt-4 font-display text-display-md font-semibold text-ink"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-2xl text-lg text-ink/65"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </section>
  )
}
