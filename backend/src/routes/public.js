import { Router } from 'express'
import { query } from '../db/pool.js'
import { isEmail, makeAccessCode } from '../utils/helpers.js'
import { sendCredentials } from '../utils/mailer.js'

// No login needed: this is what students see when they open the share link
const router = Router()

async function findContest(slug) {
  const [contest] = await query(
    `SELECT c.*, a.club_name,
       (SELECT count(*) FROM questions q WHERE q.contest_id = c.id) AS question_count
     FROM contests c JOIN admins a ON a.id = c.admin_id WHERE c.slug = $1`,
    [slug],
  )
  return contest
}

router.get('/contests/:slug', async (req, res) => {
  const c = await findContest(req.params.slug)
  if (!c) return res.status(404).json({ error: 'This contest link is not valid' })
  res.json({
    contest: {
      title: c.title,
      description: c.description,
      clubName: c.club_name,
      durationMinutes: c.duration_minutes,
      questionCount: Number(c.question_count),
    },
  })
})

router.post('/contests/:slug/register', async (req, res) => {
  const contest = await findContest(req.params.slug)
  if (!contest) return res.status(404).json({ error: 'This contest link is not valid' })

  const { name, mobile, email, college, note = '' } = req.body
  if (!name?.trim() || !college?.trim()) return res.status(400).json({ error: 'Name and college are required' })
  if (!/^\+?[0-9 -]{8,15}$/.test(mobile || '')) return res.status(400).json({ error: 'Enter a valid mobile number' })
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email' })

  const cleanEmail = email.trim().toLowerCase()
  const [already] = await query('SELECT id FROM registrations WHERE contest_id = $1 AND email = $2', [
    contest.id,
    cleanEmail,
  ])
  if (already) return res.status(409).json({ error: 'This email is already registered. Check your inbox for the password.' })

  const [registration] = await query(
    `INSERT INTO registrations (contest_id, name, mobile, email, college, note, access_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [contest.id, name.trim(), mobile.trim(), cleanEmail, college.trim(), note.trim(), makeAccessCode()],
  )

  // Don't fail the signup if the mail server is down; admin can press "resend"
  sendCredentials({ registration, contest }).catch((err) => console.error('Mail failed:', err.message))

  res.status(201).json({ ok: true })
})

export default router
