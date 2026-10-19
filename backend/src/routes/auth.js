import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/pool.js'
import { signToken, requireAdmin } from '../middleware/auth.js'
import { isEmail } from '../utils/helpers.js'

const router = Router()

const publicAdmin = (a) => ({
  id: a.id,
  name: a.name,
  clubName: a.club_name,
  email: a.email,
  downloadSlug: a.download_slug,
})

router.post('/signup', async (req, res) => {
  const { name, clubName, email, password } = req.body
  if (!name || !clubName || !isEmail(email) || !password || password.length < 6)
    return res.status(400).json({ error: 'Fill all fields (password min 6 characters)' })

  const exists = await query('SELECT id FROM admins WHERE email = $1', [email.toLowerCase()])
  if (exists.length) return res.status(409).json({ error: 'This email already has an account' })

  const hash = await bcrypt.hash(password, 10)
  const [admin] = await query(
    'INSERT INTO admins (name, club_name, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, clubName, email.toLowerCase(), hash],
  )
  res.status(201).json({ token: signToken({ id: admin.id, role: 'admin' }), admin: publicAdmin(admin) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const [admin] = await query('SELECT * FROM admins WHERE email = $1', [(email || '').toLowerCase()])
  if (!admin || !(await bcrypt.compare(password || '', admin.password_hash)))
    return res.status(401).json({ error: 'Wrong email or password' })

  res.json({ token: signToken({ id: admin.id, role: 'admin' }), admin: publicAdmin(admin) })
})

router.get('/me', requireAdmin, async (req, res) => {
  const [admin] = await query('SELECT * FROM admins WHERE id = $1', [req.user.id])
  if (!admin) return res.status(401).json({ error: 'Please login again' })
  res.json({ admin: publicAdmin(admin) })
})

export default router
