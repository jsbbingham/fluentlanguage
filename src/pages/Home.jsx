import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Quote } from 'lucide-react'
import HeroBackdrop from '../components/HeroBackdrop.jsx'
import { fadeUp, scaleIn, stagger, inViewProps } from '../lib/motion.js'
import { SERVICES, TRUST, STATS, FOCUS_AREAS, BRAND } from '../data/site.js'

/* ------------------------------- HERO ---------------------------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />

      <div className="container-x relative grid items-center gap-12 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-28">
        {/* Editorial column */}
        <motion.div
          variants={stagger(0.09, 0.05)}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Professional Translation & Interpretation
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-display-lg font-semibold text-ink"
          >
            Spanish <span className="text-gradient-accent">↔</span> English,
            <br />
            interpreted with{' '}
            <em className="italic text-gradient-accent">precision.</em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-lg leading-relaxed text-ink/70"
          >
            {BRAND.person} bridges cultures with {BRAND.yearsExperience} years of
            professional experience — serving legal, medical, and educational
            organizations across California.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
            <Link to="/contact" className="btn-primary">
              Get a Quote
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.ul
            variants={fadeUp}
            className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-ink/70">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-terracotta-50 text-terracotta-600">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Bento credibility cluster */}
        <motion.div
          variants={stagger(0.12, 0.25)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 sm:gap-5"
        >
          {/* Tall feature card */}
          <motion.div
            variants={scaleIn}
            className="glass row-span-2 flex flex-col justify-between rounded-3xl p-6 shadow-float"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-accent text-white shadow-glow">
              <Quote className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-xl leading-snug text-ink">
                “Accurate, calm, and completely reliable in the courtroom.”
              </p>
              <p className="mt-4 text-sm font-medium text-ink/55">
                — Repeat client, workers' compensation law
              </p>
            </div>
          </motion.div>

          {/* Stat cards */}
          {STATS.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={value}
              variants={scaleIn}
              className="glass flex flex-col gap-3 rounded-3xl p-6 shadow-elevated"
            >
              <Icon className="h-6 w-6 text-terracotta-500" aria-hidden="true" />
              <div>
                <div className="font-display text-3xl font-semibold text-ink">
                  {value}
                </div>
                <div className="mt-1 text-sm leading-snug text-ink/60">{label}</div>
              </div>
            </motion.div>
          ))}

          {/* Focus-area chip strip spanning both columns */}
          <motion.div
            variants={scaleIn}
            className="glass col-span-2 flex flex-wrap items-center gap-2 rounded-3xl p-5"
          >
            {FOCUS_AREAS.map(({ icon: Icon, label }) => (
              <span key={label} className="chip">
                <Icon className="h-4 w-4 text-viridian-500" aria-hidden="true" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ----------------------------- SERVICES -------------------------------- */

function Services() {
  return (
    <section className="relative bg-linen py-24 lg:py-32">
      <div className="container-x">
        <motion.div {...inViewProps} variants={stagger(0.08)} className="max-w-2xl">
          <motion.span variants={fadeUp} className="eyebrow">
            What I Do
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-display-md font-semibold text-ink"
          >
            Services built on trust
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-lg text-ink/65">
            From a single certified document to a full day of simultaneous
            interpretation — handled with the precision high-stakes settings
            demand.
          </motion.p>
        </motion.div>

        {/* Bento grid — feature tile spans two columns */}
        <motion.div
          {...inViewProps}
          variants={stagger(0.1, 0.1)}
          className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map(({ icon: Icon, title, body, feature }) => (
            <motion.article
              key={title}
              variants={fadeUp}
              className={[
                'card card-hover group flex flex-col p-7',
                feature ? 'lg:col-span-2 lg:flex-row lg:items-center lg:gap-8' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'grid place-items-center rounded-2xl bg-terracotta-50 text-terracotta-600 transition-colors duration-300 group-hover:bg-gradient-accent group-hover:text-white',
                  feature ? 'h-16 w-16 shrink-0' : 'h-14 w-14',
                ].join(' ')}
              >
                <Icon className={feature ? 'h-7 w-7' : 'h-6 w-6'} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className={feature ? '' : 'mt-5'}>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink/65">
                  {body}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------- CTA ----------------------------------- */

function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-mesh-ink opacity-70 animate-mesh-drift" aria-hidden="true" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.15]" aria-hidden="true" />

      <motion.div
        {...inViewProps}
        variants={stagger(0.1)}
        className="container-x relative text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="mx-auto max-w-3xl font-display text-display-md font-semibold text-white"
        >
          Ready to work together?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-lg text-white/70"
        >
          Whether you need a certified translation, on-site interpretation, or a
          reliable language partner for your organization — let's talk.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex justify-center">
          <Link to="/contact" className="btn-primary">
            Contact {BRAND.person.split(' ')[0]}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <CtaBand />
    </>
  )
}
