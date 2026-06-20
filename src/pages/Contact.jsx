import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, Send, Loader2, Languages } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { postForm } from '../lib/api.js'
import { CONTACT_SUBJECTS, FOCUS_AREAS, BRAND } from '../data/site.js'

function ContactForm() {
  const [status, setStatus] = useState({ type: null, msg: '' })
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    const form = e.target
    if (form.website.value) return // honeypot

    setBusy(true)
    setStatus({ type: null, msg: '' })
    try {
      const json = await postForm('api/contact.php', form)
      if (json.success) {
        setStatus({
          type: 'success',
          msg: "Message sent! Isela will get back to you within 24–48 hours.",
        })
        form.reset()
      } else {
        setStatus({ type: 'error', msg: json.message || 'Failed to send. Please try again.' })
      }
    } catch {
      setStatus({
        type: 'error',
        msg: 'An error occurred. Please try again or email directly.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div {...inViewProps} variants={fadeUp} className="card p-8 lg:p-10">
      <h2 className="font-display text-2xl font-semibold text-ink">Send a message</h2>
      <p className="mt-2 text-ink/60">
        Tell me a little about your project and I'll respond within 24–48 hours.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="c-name" className="mb-2 block text-sm font-medium text-ink">Name</label>
            <input id="c-name" name="name" type="text" required className="field" placeholder="Your full name" />
          </div>
          <div>
            <label htmlFor="c-email" className="mb-2 block text-sm font-medium text-ink">Email</label>
            <input id="c-email" name="email" type="email" required className="field" placeholder="you@example.com" />
          </div>
        </div>

        <div>
          <label htmlFor="c-subject" className="mb-2 block text-sm font-medium text-ink">Service needed</label>
          <select id="c-subject" name="subject" required defaultValue="" className="field">
            <option value="" disabled>Select a service…</option>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="c-message" className="mb-2 block text-sm font-medium text-ink">Message</label>
          <textarea id="c-message" name="message" rows={5} required minLength={10} className="field resize-y" placeholder="How can I help?" />
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {busy ? 'Sending…' : 'Send Message'}
        </button>

        {status.type && (
          <p
            className={[
              'rounded-xl px-4 py-3 text-sm font-medium',
              status.type === 'success'
                ? 'bg-viridian-500/10 text-viridian-600'
                : 'bg-error/10 text-error',
            ].join(' ')}
          >
            {status.msg}
          </p>
        )}
      </form>
    </motion.div>
  )
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-50 text-terracotta-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      </div>
      <div className="mt-4 text-[15px] text-ink/70">{children}</div>
    </div>
  )
}

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's discuss your needs"
        subtitle="Translation, interpretation, or an ongoing language partnership — reach out and let's find the right fit."
      />

      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:gap-14">
          <ContactForm />

          <motion.aside {...inViewProps} variants={stagger(0.1)} className="space-y-5">
            <motion.div variants={fadeUp}>
              <InfoCard icon={Mail} title="Direct email">
                <a
                  href={`mailto:${BRAND.email}`}
                  className="font-medium text-terracotta-600 transition-colors hover:text-terracotta-700"
                >
                  {BRAND.email}
                </a>
                <p className="mt-3 flex items-center gap-2 text-ink/55">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {BRAND.location}
                </p>
              </InfoCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <InfoCard icon={Languages} title="Services">
                <ul className="space-y-1.5">
                  {FOCUS_AREAS.map(({ label }) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </InfoCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <InfoCard icon={Clock} title="Availability">
                <p>Typical response within 24–48 hours. In-person and virtual engagements across California.</p>
              </InfoCard>
            </motion.div>
          </motion.aside>
        </div>
      </section>
    </>
  )
}
