import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { describeError, explainMailError, mailInfo, sendTestMail } from '../utils/mailer.js'

// Lets an admin check the email setup from the dashboard
const router = Router()
router.use(requireAdmin)

router.get('/status', (req, res) => res.json(mailInfo()))

// Sends one test email to the admin's own address and reports the exact result
router.post('/test', rateLimit({ windowMs: 10 * 60 * 1000, max: 8, key: (req) => `mail-test:${req.user.id}` }), async (req, res) => {
  const [admin] = await query('SELECT email FROM admins WHERE id = $1', [req.user.id])
  try {
    await sendTestMail(admin.email)
    res.json({ ok: true, to: admin.email, mode: mailInfo().mode })
  } catch (err) {
    res.status(502).json({ error: describeError(err), hint: explainMailError(err) })
  }
})

export default router
