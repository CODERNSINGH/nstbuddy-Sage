import { Router } from 'express'
import { Readable } from 'node:stream'
import { config } from '../config.js'

// GET /api/download/app
// The Mac installer lives in a GitHub Release. We stream it through our own address so the
// student's browser starts the download straight away (one URL, no redirect to GitHub).
const router = Router()

router.get('/app', async (req, res) => {
  const stop = new AbortController()
  res.on('close', () => stop.abort()) // student cancelled the download

  let upstream
  try {
    upstream = await fetch(config.downloadSource, { signal: stop.signal }) // follows GitHub's redirect
  } catch {
    return res.status(502).json({ error: 'The download is not available right now. Please try again.' })
  }
  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: 'The app file was not found. Ask your teacher.' })
  }

  res.set({
    'Content-Type': 'application/x-apple-diskimage',
    'Content-Disposition': 'attachment; filename="NstBuddy-Sage-arm64.dmg"',
    'Cache-Control': 'public, max-age=300',
  })
  const size = upstream.headers.get('content-length')
  if (size) res.set('Content-Length', size) // lets the browser show real progress

  Readable.fromWeb(upstream.body)
    .on('error', () => res.destroy())
    .pipe(res)
})

export default router
