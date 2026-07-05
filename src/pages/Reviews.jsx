import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Loader2, MessageSquare, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Seo from '../lib/Seo.jsx'
import { PAGE_SEO } from '../data/seo.js'
import { fadeUp, stagger, inViewProps } from '../lib/motion.js'
import { postForm } from '../lib/api.js'

function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={[size, n <= value ? 'fill-saffron-400 text-saffron-400' : 'fill-ink/10 text-ink/15'].join(' ')}
        />
      ))}
    </div>
  )
}

function initials(name) {
  return (name || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function ReviewCard({ review }) {
  const rating = parseInt(review.rating) || 0
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <motion.article variants={fadeUp} className="card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-accent text-sm font-semibold text-white">
          {initials(review.name)}
        </span>
        <div>
          <div className="font-semibold text-ink">{review.name || 'Anonymous'}</div>
          <div className="text-sm text-ink/50">{date}</div>
        </div>
      </div>
      <div className="mt-4">
        <Stars value={rating} />
      </div>
      <p className="mt-3 leading-relaxed text-ink/75">{review.comment}</p>
    </motion.article>
  )
}

function ReviewForm({ onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [status, setStatus] = useState({ type: null, msg: '' })
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    const form = e.target
    if (form.website.value) return // honeypot

    if (rating < 1) {
      setStatus({ type: 'error', msg: 'Please select a star rating.' })
      return
    }

    setBusy(true)
    setStatus({ type: null, msg: '' })
    try {
      const json = await postForm('api/reviews.php', form, {
        action: 'submit',
        rating: String(rating),
      })
      if (json.success) {
        setStatus({ type: 'success', msg: 'Thank you! Your review has been submitted.' })
        form.reset()
        setRating(0)
        onSubmitted?.()
      } else {
        setStatus({ type: 'error', msg: json.message || 'Failed to submit review.' })
      }
    } catch {
      setStatus({ type: 'error', msg: 'An error occurred. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card mx-auto max-w-2xl p-8 lg:p-10">
      <h2 className="text-center font-display text-2xl font-semibold text-ink">
        Share your experience
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-ink/60">
        Your feedback helps others find trusted language support.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {/* Honeypot */}
        {/* Honeypot — display:none hides it from users and assistive tech;
            bots parsing the raw form still fill it. */}
        <div className="hidden">
          <label htmlFor="r-website">Leave this field empty</label>
          <input id="r-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Your rating</label>
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className="transition-transform duration-150 hover:scale-110"
              >
                <Star
                  className={[
                    'h-9 w-9 transition-colors',
                    n <= (hover || rating)
                      ? 'fill-saffron-400 text-saffron-400'
                      : 'fill-ink/5 text-ink/20',
                  ].join(' ')}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rv-name" className="mb-2 block text-sm font-medium text-ink">
              Name <span className="text-ink/40">(optional)</span>
            </label>
            <input id="rv-name" name="name" type="text" className="field" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="rv-email" className="mb-2 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="rv-email"
              name="email"
              type="email"
              required
              className="field"
              placeholder="you@example.com"
            />
            <p className="mt-1.5 text-xs text-ink/45">Never published — used only to verify the review.</p>
          </div>
        </div>

        <div>
          <label htmlFor="rv-comment" className="mb-2 block text-sm font-medium text-ink">
            Review
          </label>
          <textarea
            id="rv-comment"
            name="comment"
            rows={4}
            required
            className="field resize-y"
            placeholder="Tell us about your experience…"
          />
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Submitting…' : 'Submit Review'}
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
    </div>
  )
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [state, setState] = useState('loading') // loading | ready | empty | error

  async function load() {
    try {
      const res = await fetch('api/reviews.php?action=list')
      const json = await res.json()
      if (json.success && json.reviews.length > 0) {
        setReviews(json.reviews)
        setState('ready')
      } else {
        setReviews([])
        setState('empty')
      }
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + parseInt(r.rating || 0), 0) / reviews.length
      : 0

  return (
    <>
      <Seo {...PAGE_SEO.reviews} />
      <PageHeader
        eyebrow="Reviews"
        title="Trusted by clients across California"
        subtitle="Real feedback from the organizations and professionals I've worked with."
      />

      <section className="py-20 lg:py-28">
        <div className="container-x">
          {/* Summary */}
          {state === 'ready' && (
            <motion.div {...inViewProps} variants={fadeUp} className="mb-14 text-center">
              <div className="font-display text-6xl font-semibold text-ink">{avg.toFixed(1)}</div>
              <div className="mt-3 flex justify-center">
                <Stars value={Math.round(avg)} size="h-6 w-6" />
              </div>
              <div className="mt-3 text-sm text-ink/55">
                Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </div>
            </motion.div>
          )}

          {/* States */}
          {state === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-16 text-ink/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading reviews…
            </div>
          )}

          {state === 'error' && (
            <div className="mx-auto max-w-md py-12 text-center text-ink/55">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-warning" />
              <p className="font-display text-xl text-ink">Unable to load reviews</p>
              <p className="mt-1">Please try again later.</p>
            </div>
          )}

          {state === 'empty' && (
            <div className="mx-auto max-w-md py-12 text-center text-ink/55">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-terracotta-300" />
              <p className="font-display text-xl text-ink">No reviews yet</p>
              <p className="mt-1">Be the first to share your experience.</p>
            </div>
          )}

          {state === 'ready' && (
            <motion.div
              {...inViewProps}
              variants={stagger(0.08)}
              className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2"
            >
              {reviews.map((r) => (
                <ReviewCard key={r.id || r.created_at} review={r} />
              ))}
            </motion.div>
          )}

          <div className="mt-16">
            <ReviewForm onSubmitted={load} />
          </div>
        </div>
      </section>
    </>
  )
}
