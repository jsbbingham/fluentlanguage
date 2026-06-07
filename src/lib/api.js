// API helpers for the hardened PHP backend.
//
// The backend (api/contact.php, api/reviews.php) requires a CSRF token tied to
// a PHP session cookie. Flow: GET api/csrf.php to mint a token (and set the
// session cookie), then POST the form with that token. Same-origin in
// production, so the cookie rides along automatically.

let cachedToken = null

export async function getCsrfToken(force = false) {
  if (cachedToken && !force) return cachedToken
  const res = await fetch('api/csrf.php', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('csrf')
  const json = await res.json()
  cachedToken = json.token
  return cachedToken
}

// POST a form to a PHP endpoint with a fresh CSRF token attached.
// `form` is the <form> element; returns the parsed JSON response.
export async function postForm(endpoint, form, extraFields = {}) {
  const token = await getCsrfToken()
  const data = new FormData(form)
  data.set('csrf_token', token)
  for (const [k, v] of Object.entries(extraFields)) data.set(k, v)

  const res = await fetch(endpoint, {
    method: 'POST',
    body: data,
    credentials: 'same-origin',
  })
  const json = await res.json()

  // If the token went stale (expired session), refresh once and retry.
  if (!json.success && /reload the page/i.test(json.message || '')) {
    const fresh = await getCsrfToken(true)
    data.set('csrf_token', fresh)
    const retry = await fetch(endpoint, {
      method: 'POST',
      body: data,
      credentials: 'same-origin',
    })
    return retry.json()
  }
  return json
}
