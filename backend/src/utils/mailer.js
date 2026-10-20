import nodemailer from 'nodemailer'
import { config } from '../config.js'
import { query } from '../db/pool.js'

/*
  Two ways to send mail (pick one in .env):
  1. SMTP  : SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
             (Render free instances BLOCK ports 25, 465 and 587. Use a paid instance,
              an SMTP provider on port 2525 such as Brevo, or option 2.)
  2. Resend: RESEND_API_KEY  (plain HTTPS, never blocked)
  If neither is set, mails are only printed in the terminal.
*/
const { host, port, user, pass } = config.smtp
const BLOCKED_ON_RENDER = [25, 465, 587]

const transporter = host
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
      // fail fast so a blocked port shows an error in seconds, not minutes
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 15_000,
    })
  : null

export const mailMode = () => (config.resendApiKey ? 'resend' : transporter ? 'smtp' : 'none')

// What the admin dashboard shows (no passwords or keys)
export const mailInfo = () => ({
  mode: mailMode(),
  from: config.mailFrom,
  host: mailMode() === 'smtp' ? `${host}:${port}` : mailMode() === 'resend' ? 'api.resend.com' : '',
  smtpPortBlockedOnRender: config.onRender && mailMode() === 'smtp' && BLOCKED_ON_RENDER.includes(port),
})

// Turns a raw mail error into advice a person can act on
export function explainMailError(err) {
  const text = String(err?.message || err)
  const code = err?.code
  if (/Resend error 401|API key is invalid|restricted_api_key/i.test(text))
    return 'The Resend API key is wrong. Create a new key in resend.com and update RESEND_API_KEY.'
  if (/Resend error (403|422)|domain is not verified|only send testing emails/i.test(text))
    return 'Resend only sends from a verified domain. Verify your domain in resend.com and set MAIL_FROM to an address on it (until then it can only email your own account).'
  if (code === 'EAUTH' || /535|Invalid login|Username and Password not accepted|BadCredentials/i.test(text))
    return 'The mail server rejected the login. For Gmail use a 16-letter App Password (2-Step Verification must be on), not your normal password.'
  if (['ETIMEDOUT', 'ECONNECTION', 'ESOCKET', 'ECONNREFUSED', 'EDNS', 'ENOTFOUND'].includes(code) || /timeout|ENOTFOUND/i.test(text)) {
    return mailInfo().smtpPortBlockedOnRender
      ? `Render blocks SMTP port ${port} on free instances. Set RESEND_API_KEY (HTTPS) or use an SMTP provider on port 2525.`
      : 'Cannot reach the mail server. Check SMTP_HOST and SMTP_PORT.'
  }
  if (/self.signed|certificate/i.test(text)) return 'The mail server certificate was rejected. Check SMTP_HOST.'
  return 'Check the mail settings in the backend environment.'
}

// Node sometimes gives an empty message (AggregateError); always include the error code
export function describeError(err) {
  const inner = err?.errors?.[0]
  const message = err?.message || inner?.message || 'unknown error'
  const code = err?.code || inner?.code
  return String(code && !message.includes(code) ? `${code}: ${message}` : message).slice(0, 300)
}

export async function checkMail() {
  const info = mailInfo()
  if (info.mode === 'resend') return console.log('Mail: using Resend (HTTPS)')
  if (info.mode === 'none') return console.log('Mail: not configured, emails will be printed here')
  if (info.smtpPortBlockedOnRender)
    console.warn(`Mail: WARNING Render free instances block SMTP port ${port}. Use RESEND_API_KEY or port 2525.`)
  try {
    await transporter.verify()
    console.log(`Mail: ready via ${host}:${port}`)
  } catch (err) {
    console.error(`Mail: SMTP login failed on ${host}:${port} ->`, describeError(err), '|', explainMailError(err))
  }
}

async function sendWithResend({ to, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.mailFrom, to, subject, text, html }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

// Throws if the mail could not be sent, so callers can show the reason
export async function sendMail(mail) {
  if (config.resendApiKey) return sendWithResend(mail)
  if (!transporter) {
    console.log(`\n--- EMAIL (not sent, mail not configured) ---\nTo: ${mail.to}\n${mail.subject}\n${mail.text}\n`)
    return
  }
  await transporter.sendMail({ from: config.mailFrom, ...mail })
}

export function sendTestMail(to) {
  return sendMail({
    to,
    subject: 'NstBuddy Sage: test email',
    text: 'Your email setup works. Students will receive their password mails from this address.',
  })
}

// Student-typed text goes into the HTML mail, so it must be escaped
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function sendCredentials({ registration, contest }) {
  const { name, email, access_code: code } = registration
  const text = [
    `Hi ${name},`,
    ``,
    `You are registered for "${contest.title}".`,
    `Download the NstBuddy Sage app, open it and login with:`,
    ``,
    `Email:    ${email}`,
    `Password: ${code}`,
    ``,
    `Duration: ${contest.duration_minutes} minutes. Keep this password private.`,
  ].join('\n')

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b0b0f">
    <h2 style="margin:0 0 4px"><span style="color:#0057c1">nst</span>buddy <span style="color:#2f9e63">Sage</span></h2>
    <p style="color:#555">Hi ${esc(name)}, you are registered for <b>${esc(contest.title)}</b>.</p>
    <div style="background:#f4f6fa;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0;font-size:12px;color:#667;letter-spacing:1px">EMAIL</p>
      <p style="margin:2px 0 12px;font-weight:600">${esc(email)}</p>
      <p style="margin:0;font-size:12px;color:#667;letter-spacing:1px">YOUR PASSWORD</p>
      <p style="margin:2px 0 0;font-size:22px;font-weight:700;font-family:monospace;color:#0057c1">${esc(code)}</p>
    </div>
    <p style="color:#555;font-size:14px">Open the NstBuddy Sage exam app on your Mac and login with these. Duration: ${esc(contest.duration_minutes)} minutes. Keep this password private.</p>
  </div>`

  return sendMail({ to: email, subject: `Your password for ${contest.title}`, text, html })
}

// ---- Delivery with bookkeeping + automatic retries --------------------------------------

// One try. Records the result on the registration. Never throws.
async function attemptDelivery({ registration, contest }) {
  try {
    await sendCredentials({ registration, contest })
    await query(
      "UPDATE registrations SET mail_status = 'sent', mail_error = '', mail_attempts = mail_attempts + 1 WHERE id = $1",
      [registration.id],
    )
    return { sent: true }
  } catch (err) {
    const error = describeError(err)
    console.error(`Mail to ${registration.email} failed:`, error)
    await query(
      "UPDATE registrations SET mail_status = 'failed', mail_error = $2, mail_attempts = mail_attempts + 1 WHERE id = $1",
      [registration.id, error],
    )
    return { sent: false, error, hint: explainMailError(err) }
  }
}

// After a failed first try: try again after 1 minute, then after 5 minutes (unless it was sent meanwhile)
const RETRY_DELAYS_MS = [60_000, 300_000]

function scheduleRetries(args, step = 0) {
  if (step >= RETRY_DELAYS_MS.length) return
  setTimeout(async () => {
    const [row] = await query('SELECT mail_status FROM registrations WHERE id = $1', [args.registration.id])
    if (!row || row.mail_status === 'sent') return // sent by the admin's Resend button already
    const result = await attemptDelivery(args)
    if (!result.sent) scheduleRetries(args, step + 1)
  }, RETRY_DELAYS_MS[step]).unref()
}

// Used right after registration: first try is awaited (so the student hears the truth),
// retries happen in the background.
export async function deliverCredentials(args) {
  const result = await attemptDelivery(args)
  if (!result.sent) scheduleRetries(args)
  return result
}

// Used by the admin's Resend button: one try, no background retries.
export const resendCredentials = attemptDelivery

// On server start: finish mails that were interrupted by a restart (still 'pending')
export async function retryPendingMails() {
  const rows = await query(
    `SELECT r.*, c.title, c.duration_minutes FROM registrations r JOIN contests c ON c.id = r.contest_id
     WHERE r.mail_status = 'pending' AND r.created_at > now() - interval '1 day' ORDER BY r.id LIMIT 50`,
  )
  for (const row of rows) {
    await attemptDelivery({ registration: row, contest: { title: row.title, duration_minutes: row.duration_minutes } })
  }
  if (rows.length) console.log(`Mail: retried ${rows.length} interrupted email(s)`)
}
