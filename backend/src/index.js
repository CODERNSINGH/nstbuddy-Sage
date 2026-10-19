import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import contestRoutes from './routes/contests.js'
import publicRoutes from './routes/public.js'
import examRoutes from './routes/exam.js'
import { checkMail } from './utils/mailer.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes) // admin signup / login
app.use('/api/contests', contestRoutes) // admin: contests, questions, students, leaderboard
app.use('/api/public', publicRoutes) // student registration page
app.use('/api/exam', examRoutes) // Electron exam app

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`)
  checkMail()
})
