import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { makeSlug } from '../utils/helpers.js'
import { sendCredentials } from '../utils/mailer.js'
import questionRoutes from './questions.js'

const router = Router()
router.use(requireAdmin)

const toContest = (c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  slug: c.slug,
  durationMinutes: c.duration_minutes,
  createdAt: c.created_at,
  questionCount: Number(c.question_count ?? 0),
  studentCount: Number(c.student_count ?? 0),
})

// Loads a contest only if it belongs to the logged-in admin
async function findOwnContest(req, res, next) {
  const [contest] = await query('SELECT * FROM contests WHERE id = $1 AND admin_id = $2', [
    req.params.id,
    req.user.id,
  ])
  if (!contest) return res.status(404).json({ error: 'Contest not found' })
  req.contest = contest
  next()
}

router.get('/', async (req, res) => {
  const rows = await query(
    `SELECT c.*,
       (SELECT count(*) FROM questions q WHERE q.contest_id = c.id) AS question_count,
       (SELECT count(*) FROM registrations r WHERE r.contest_id = c.id) AS student_count
     FROM contests c WHERE c.admin_id = $1 ORDER BY c.created_at DESC`,
    [req.user.id],
  )
  res.json({ contests: rows.map(toContest) })
})

router.post('/', async (req, res) => {
  const { title, description = '', durationMinutes = 30 } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })
  if (!(durationMinutes >= 1 && durationMinutes <= 600))
    return res.status(400).json({ error: 'Duration must be 1 to 600 minutes' })

  const [contest] = await query(
    'INSERT INTO contests (admin_id, title, description, slug, duration_minutes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.user.id, title.trim(), description, makeSlug(title), durationMinutes],
  )
  res.status(201).json({ contest: toContest(contest) })
})

router.get('/:id', findOwnContest, async (req, res) => {
  const questions = await query(
    'SELECT id, position, text, options, correct_index, explanation FROM questions WHERE contest_id = $1 ORDER BY position',
    [req.contest.id],
  )
  res.json({
    contest: toContest(req.contest),
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctIndex: q.correct_index,
      explanation: q.explanation,
    })),
  })
})

router.patch('/:id', findOwnContest, async (req, res) => {
  const title = req.body.title?.trim() || req.contest.title
  const description = req.body.description ?? req.contest.description
  const duration = req.body.durationMinutes ?? req.contest.duration_minutes
  const [contest] = await query(
    'UPDATE contests SET title=$1, description=$2, duration_minutes=$3 WHERE id=$4 RETURNING *',
    [title, description, duration, req.contest.id],
  )
  res.json({ contest: toContest(contest) })
})

router.delete('/:id', findOwnContest, async (req, res) => {
  await query('DELETE FROM contests WHERE id = $1', [req.contest.id])
  res.json({ ok: true })
})

// ---- Students who registered (the web page polls this to show "live" signups)
router.get('/:id/registrations', findOwnContest, async (req, res) => {
  const rows = await query(
    `SELECT r.id, r.name, r.mobile, r.email, r.college, r.note, r.created_at,
            a.started_at, a.submitted_at, a.score, a.total
     FROM registrations r LEFT JOIN attempts a ON a.registration_id = r.id
     WHERE r.contest_id = $1 ORDER BY r.created_at DESC`,
    [req.contest.id],
  )
  res.json({
    registrations: rows.map((r) => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile,
      email: r.email,
      college: r.college,
      note: r.note,
      registeredAt: r.created_at,
      status: r.submitted_at ? 'submitted' : r.started_at ? 'writing' : 'registered',
      score: r.score,
      total: r.total,
    })),
  })
})

router.post('/:id/registrations/:regId/resend', findOwnContest, async (req, res) => {
  const [registration] = await query(
    'SELECT * FROM registrations WHERE id = $1 AND contest_id = $2',
    [req.params.regId, req.contest.id],
  )
  if (!registration) return res.status(404).json({ error: 'Student not found' })
  await sendCredentials({ registration, contest: req.contest })
  res.json({ ok: true })
})

// ---- Leaderboard: highest score first, faster finish wins a tie
router.get('/:id/leaderboard', findOwnContest, async (req, res) => {
  const rows = await query(
    `SELECT r.name, r.email, r.college, a.score, a.total, a.violations,
            EXTRACT(EPOCH FROM (a.submitted_at - a.started_at))::int AS seconds_taken
     FROM attempts a JOIN registrations r ON r.id = a.registration_id
     WHERE r.contest_id = $1 AND a.submitted_at IS NOT NULL
     ORDER BY a.score DESC, seconds_taken ASC`,
    [req.contest.id],
  )
  res.json({
    leaderboard: rows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      email: r.email,
      college: r.college,
      score: r.score,
      total: r.total,
      secondsTaken: r.seconds_taken,
      violations: r.violations,
    })),
  })
})

router.use('/:id/questions', findOwnContest, questionRoutes)

export default router
