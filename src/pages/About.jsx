import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Award } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Seo from '../lib/Seo.jsx'
import { PAGE_SEO } from '../data/seo.js'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { CREDENTIALS, FOCUS_AREAS, AFFILIATIONS, PORTRAIT, BRAND } from '../data/site.js'

export default function About() {
  return (
    <>
      <Seo {...PAGE_SEO.about} />
      <PageHeader
        eyebrow="About"
        title="Two decades bridging language and trust"
        subtitle={`${BRAND.person} — professional Spanish ↔ English interpreter and translator.`}
      />

      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:gap-16">
          {/* Narrative */}
          <motion.div
            {...inViewProps}
            variants={stagger(0.08)}
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="text-xl leading-relaxed text-ink/80">
              For more than {BRAND.yearsExperience} years, I have helped people be
              understood when it matters most — in courtrooms, hospitals, and
              classrooms across California.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink/70">
              <p>
                My work spans certified document translation and live
                interpretation — simultaneous, consecutive, and sight — for
                organizations that cannot afford ambiguity. Medical reports,
                psychological evaluations, IEPs, IFSPs, IPPs, and legal filings
                all carry weight, and every word is treated accordingly.
              </p>
              <p>
                I specialize in workers' compensation law and healthcare settings,
                where precise terminology and cultural fluency are inseparable. The
                goal is never just a literal translation — it's faithful meaning,
                delivered with the calm and discretion these environments require.
              </p>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mt-12 font-display text-2xl font-semibold text-ink"
            >
              Areas of focus
            </motion.h2>
            <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-3">
              {FOCUS_AREAS.map(({ icon: Icon, label }) => (
                <span key={label} className="chip">
                  <Icon className="h-4 w-4 text-viridian-500" />
                  {label}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10">
              <Link to="/contact" className="btn-primary">
                Start a conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Sidebar: portrait + credentials + affiliations */}
          <motion.aside {...inViewProps} variants={stagger(0.1)} className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Portrait */}
            <motion.div variants={fadeUp} className="overflow-hidden rounded-3xl border border-ink/8 shadow-elevated">
              <div className="relative">
                <img
                  src={PORTRAIT}
                  alt={`${BRAND.person}, Spanish ↔ English interpreter and translator`}
                  className="aspect-[4/5] w-full object-cover"
                  width="527"
                  height="1280"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5">
                  <div className="font-display text-lg font-semibold text-white">{BRAND.person}</div>
                  <div className="text-sm text-white/75">{BRAND.tagline}</div>
                </div>
              </div>
            </motion.div>

            {/* Credentials */}
            <motion.div variants={fadeUp} className="card p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-accent text-white shadow-glow">
                  <Award className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold text-ink">Credentials</h3>
              </div>
              <ul className="mt-6 space-y-3.5">
                {CREDENTIALS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-ink/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-viridian-500" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Affiliations */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-ink/8 bg-linen p-7">
              <h3 className="font-display text-lg font-semibold text-ink">Trusted by</h3>
              <ul className="mt-4 space-y-2.5">
                {AFFILIATIONS.map((item) => (
                  <li key={item} className="text-[15px] leading-snug text-ink/70">{item}</li>
                ))}
              </ul>
            </motion.div>
          </motion.aside>
        </div>
      </section>
    </>
  )
}
