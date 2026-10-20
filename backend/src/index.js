import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import contestRoutes from './routes/contests.js'
import publicRoutes from './routes/public.js'
import examRoutes from './routes/exam.js'
import mailRoutes from './routes/mail.js'
import downloadRoutes from './routes/download.js'
import { startKeepAlive } from './keepAlive.js'
import { checkMail, retryPendingMails } from './utils/mailer.js'
import { attachLive } from './live.js'

const app = express()
app.set('trust proxy', 1) // behind Render's proxy: req.ip = the real visitor
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes) // admin signup / login
app.use('/api/contests', contestRoutes) // admin: contests, questions, students, leaderboard
app.use('/api/public', publicRoutes) // student registration page
app.use('/api/exam', examRoutes) // Electron exam app
app.use('/api/mail', mailRoutes) // admin: email status + test mail
app.use('/api/download', downloadRoutes) // Mac app installer (from GitHub Releases)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

const server = app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`)
  checkMail()
  retryPendingMails().catch((err) => console.error('Mail retry failed:', err.message))
  startKeepAlive()
})

attachLive(server) // live student monitoring (WebSocket signaling)
