// Tiny in-memory limiter: at most `max` requests per `windowMs` for the same key.
// Default key = client IP. Pass a custom key (e.g. IP + email) where a whole class shares one IP.
export function rateLimit({ windowMs, max, key = (req) => req.ip, message = 'Too many tries. Please wait a few minutes.' }) {
  const hits = new Map() // key -> { count, resetAt }

  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k)
  }, windowMs).unref()

  return (req, res, next) => {
    const id = key(req)
    const now = Date.now()
    let entry = hits.get(id)
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(id, entry)
    }
    if (++entry.count > max) return res.status(429).json({ error: message })
    next()
  }
}
