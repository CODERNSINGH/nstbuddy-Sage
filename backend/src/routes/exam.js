import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireStudent, signToken } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { shuffledOrder } from '../utils/helpers.js'

// Used by the Electron exam app
const router = Router()

const GRACE_MS = 30_000 // network delay allowed after the timer hits zero

// Only keep answers shaped like { "<questionId>": 0..3 }. Never trust what the app sends.
function cleanAnswers(raw) {
  const clean = {}
  if (raw && typeof raw === 'object') {
    for (const [id, choice] of Object.entries(raw).slice(0, 1000)) {
      if (/^\d+$/.test(id) && Number.isInteger(choice) && choice >= 0 && choice <= 3) clean[id] = choice
    }
  }
  return clean
}

// The student's attempt plus the moment the exam ends (from the SERVER clock, not the Mac's)
async function loadAttempt(registrationId) {
  const [attempt] = await query(
    `SELECT a.*, c.duration_minutes FROM attempts a
     JOIN registrations r ON r.id = a.registration_id JOIN contests c ON c.id = r.contest_id
     WHERE a.registration_id = $1`,
    [registrationId],
  )
  if (attempt) attempt.endsAt = new Date(attempt.started_at).getTime() + attempt.duration_minutes * 60 * 1000
  return attempt
}

// Same IP + same email = one student. A whole class on one Wi-Fi is not blocked.
const loginLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 12, key: (req) => `${req.ip}:${(req.body?.email || '').toLowerCase()}` })

router.post('/login', loginLimit, async (req, res) => {
  const { email, password } = req.body
  const [row] = await query(
    `SELECT r.id, r.name, r.contest_id, c.title, c.description, c.duration_minutes,
            (SELECT count(*) FROM questions q WHERE q.contest_id = c.id) AS question_count
     FROM registrations r JOIN contests c ON c.id = r.contest_id
     WHERE r.email = $1 AND r.access_code = $2`,
    [(email || '').trim().toLowerCase(), (password || '').trim().toUpperCase()],
  )
  if (!row) return res.status(401).json({ error: 'Wrong email or password' })

  res.json({
    token: signToken({ id: row.id, contestId: row.contest_id, role: 'student' }, '12h'),
    student: { name: row.name },
    contest: {
      title: row.title,
      description: row.description,
      durationMinutes: row.duration_minutes,
      questionCount: Number(row.question_count),
    },
  })
})

// Starts the timer the first time it is called, and returns the same deadline afterwards
router.post('/start', requireStudent, async (req, res) => {
  const [existing] = await query('SELECT * FROM attempts WHERE registration_id = $1', [req.user.id])
  if (existing?.submitted_at) return res.status(409).json({ error: 'You have already submitted this exam' })

  // ON CONFLICT keeps this safe if two start requests arrive at the same moment
  const attempt =
    existing ||
    (
      await query(
        `INSERT INTO attempts (registration_id) VALUES ($1)
         ON CONFLICT (registration_id) DO UPDATE SET registration_id = EXCLUDED.registration_id
         RETURNING *`,
        [req.user.id],
      )
    )[0]

  const [contest] = await query('SELECT duration_minutes FROM contests WHERE id = $1', [req.user.contestId])
  const questions = await query(
    'SELECT id, text, options FROM questions WHERE contest_id = $1 ORDER BY position',
    [req.user.contestId],
  )
  if (!questions.length) return res.status(400).json({ error: 'This exam has no questions yet' })

  const endsAt = new Date(attempt.started_at).getTime() + contest.duration_minutes * 60 * 1000
  res.json({
    endsAt, // ms timestamp; the app counts down to this
    serverNow: Date.now(),
    answers: attempt.answers, // so a restarted app can continue
    // Correct answers are NOT sent. Options come shuffled per student:
    // `order[i]` is the original index of the option shown at position i.
    questions: questions.map((q) => {
      const order = shuffledOrder(q.options.length, req.user.id * 100003 + q.id)
      return { id: q.id, text: q.text, options: order.map((i) => q.options[i]), order }
    }),
  })
})

// Autosave while the student is answering
router.put('/progress', requireStudent, async (req, res) => {
  const attempt = await loadAttempt(req.user.id)
  if (!attempt || attempt.submitted_at) return res.status(409).json({ error: 'This exam is already finished' })
  if (Date.now() > attempt.endsAt + GRACE_MS) return res.status(409).json({ error: 'Time is over' })

  await query('UPDATE attempts SET answers = $1 WHERE registration_id = $2', [
    JSON.stringify(cleanAnswers(req.body.answers)),
    req.user.id,
  ])
  res.json({ ok: true })
})

router.post('/violation', requireStudent, async (req, res) => {
  await query('UPDATE attempts SET violations = violations + 1 WHERE registration_id = $1', [req.user.id])
  res.json({ ok: true })
})

router.post('/submit', requireStudent, async (req, res) => {
  const attempt = await loadAttempt(req.user.id)
  if (!attempt) return res.status(400).json({ error: 'Exam was not started' })
  if (attempt.submitted_at) return res.status(409).json({ error: 'Already submitted' })

  // Submitting after the deadline? Only the answers autosaved before the time ended count.
  const late = Date.now() > attempt.endsAt + GRACE_MS
  const answers = late ? attempt.answers : cleanAnswers(req.body.answers ?? attempt.answers)
  const questions = await query(
    'SELECT id, text, options, correct_index, explanation FROM questions WHERE contest_id = $1 ORDER BY position',
    [req.user.contestId],
  )
  const score = questions.filter((q) => answers[q.id] === q.correct_index).length

  await query(
    'UPDATE attempts SET answers=$1, score=$2, total=$3, submitted_at=now() WHERE registration_id=$4',
    [JSON.stringify(answers), score, questions.length, req.user.id],
  )

  res.json({
    score,
    total: questions.length,
    review: questions.map((q) => ({
      text: q.text,
      options: q.options,
      yourIndex: answers[q.id] ?? null,
      correctIndex: q.correct_index,
      explanation: q.explanation,
    })),
  })
})

export default router
