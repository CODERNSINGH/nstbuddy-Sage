import nodemailer from 'nodemailer'
import { config } from '../config.js'

/*
  Two ways to send mail (pick one in .env):
  1. SMTP  : SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
             (Render free instances BLOCK ports 25, 465 and 587. Use a paid instance,
              or a provider with port 2525 such as Brevo, or option 2.)
  2. Resend: RESEND_API_KEY  (plain HTTPS, never blocked)
  If neither is set, mails are only printed in the terminal.
*/
const { host, port, user, pass } = config.smtp
const transporter = host
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      // fail fast so a blocked port shows an error in seconds, not minutes
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  : null

export async function checkMail() {
  if (config.resendApiKey) return console.log('Mail: using Resend (HTTPS)')
  if (!transporter) return console.log('Mail: not configured, emails will be printed here')
  try {
    await transporter.verify()
    console.log(`Mail: ready via ${host}:${port} as ${user}`)
  } catch (err) {
    console.error(`Mail: SMTP login failed on ${host}:${port} ->`, err.message)
  }
}

async function sendWithResend({ to, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.mailFrom, to, subject, text, html }),
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

export function sendCredentials({ registration, contest }) {
  const { name, email, access_code: code } = registration
  const text = [
    `Hi ${name},`,
    ``,
    `You are registered for "${contest.title}".`,
    `Open the NstBuddy Sage exam app and login with:`,
    ``,
    `Email:    ${email}`,
    `Password: ${code}`,
    ``,
    `Duration: ${contest.duration_minutes} minutes. Keep this password private.`,
  ].join('\n')

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b0b0f">
    <h2 style="margin:0 0 4px"><span style="color:#0057c1">nst</span>buddy <span style="color:#2f9e63">Sage</span></h2>
    <p style="color:#555">Hi ${name}, you are registered for <b>${contest.title}</b>.</p>
    <div style="background:#f4f6fa;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0;font-size:12px;color:#667;letter-spacing:1px">EMAIL</p>
      <p style="margin:2px 0 12px;font-weight:600">${email}</p>
      <p style="margin:0;font-size:12px;color:#667;letter-spacing:1px">YOUR PASSWORD</p>
      <p style="margin:2px 0 0;font-size:22px;font-weight:700;font-family:monospace;color:#0057c1">${code}</p>
    </div>
    <p style="color:#555;font-size:14px">Open the NstBuddy Sage exam app on your Mac and login with these. Duration: ${contest.duration_minutes} minutes. Keep this password private.</p>
  </div>`

  return sendMail({ to: email, subject: `Your password for ${contest.title}`, text, html })
}

// Sends the password mail AND records on the registration whether it worked.
// Never throws: returns { sent, error }.
export async function deliverCredentials({ registration, contest }, query) {
  try {
    await sendCredentials({ registration, contest })
    await query("UPDATE registrations SET mail_status = 'sent', mail_error = '' WHERE id = $1", [registration.id])
    return { sent: true }
  } catch (err) {
    const error = String(err.message || err).slice(0, 300)
    console.error(`Mail to ${registration.email} failed:`, error)
    await query("UPDATE registrations SET mail_status = 'failed', mail_error = $2 WHERE id = $1", [
      registration.id,
      error,
    ])
    return { sent: false, error }
  }
}
