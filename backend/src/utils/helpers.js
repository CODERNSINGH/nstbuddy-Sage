import crypto from 'node:crypto'

// Unique password sent to the student, e.g. "K7P2-9QXM-4TRD"
export function makeAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no confusing 0/O/1/I
  const part = () =>
    Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join('')
  return `${part()}-${part()}-${part()}`
}

// "DSA Weekly Quiz" -> "dsa-weekly-quiz-a3f9"
export function makeSlug(title) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${base || 'contest'}-${crypto.randomBytes(2).toString('hex')}`
}

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')

// Checks one question object; returns an error string or null
export function validateQuestion(q) {
  if (!q || typeof q.text !== 'string' || !q.text.trim()) return 'Question text is missing'
  if (!Array.isArray(q.options) || q.options.length !== 4) return 'Exactly 4 options are needed'
  if (q.options.some((o) => typeof o !== 'string' || !o.trim())) return 'Options cannot be empty'
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3)
    return 'correctIndex must be 0, 1, 2 or 3'
  return null
}

// Same seed -> same shuffle, so a student sees the same option order if the app restarts.
// Returns the ORIGINAL indexes in shuffled order, e.g. [2, 0, 3, 1].
export function shuffledOrder(length, seed) {
  let state = seed >>> 0
  const random = () => {
    // mulberry32: tiny seeded random number generator
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const order = Array.from({ length }, (_, i) => i)
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}
