import 'dotenv/config'

// Env values pasted into dashboards often carry stray spaces/newlines; trim them all.
const env = (name, fallback = '') => (process.env[name] ?? fallback).trim()

const onRender = !!process.env.RENDER // Render sets this on its servers

// Never run a public server with the built-in dev secret
if (onRender && !env('JWT_SECRET')) {
  console.error('JWT_SECRET is not set. Add it in the Render environment variables.')
  process.exit(1)
}

export const config = {
  port: process.env.PORT || 4000,
  onRender,
  databaseUrl: env('DATABASE_URL'),
  jwtSecret: env('JWT_SECRET', 'dev-secret'),
  webUrl: env('WEB_URL', 'http://localhost:5173'),
  smtp: {
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')) || 587,
    user: env('SMTP_USER'),
    pass: env('SMTP_PASS').replace(/\s+/g, ''), // Google shows App Passwords with spaces; they are not part of it
  },
  resendApiKey: env('RESEND_API_KEY'), // optional: send mail over HTTPS instead of SMTP
  mailFrom: env('MAIL_FROM', 'NstBuddy Sage <no-reply@nstbuddy.com>'),
  // Where the Mac installer is fetched from when a student clicks Download (GitHub Release asset)
  downloadSource: env(
    'DOWNLOAD_SOURCE_URL',
    'https://github.com/CODERNSINGH/nstbuddy-Sage/releases/latest/download/NstBuddy-Sage-arm64.dmg',
  ),
  // Render gives every web service its public address in RENDER_EXTERNAL_URL
  keepAliveMinutes: Number(env('KEEP_ALIVE_MINUTES')) || 14,
  keepAliveUrl: env('KEEP_ALIVE_URL') || (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}/api/health` : ''),
}
