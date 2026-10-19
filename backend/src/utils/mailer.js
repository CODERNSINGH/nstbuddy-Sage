import nodemailer from 'nodemailer'
import { config } from '../config.js'

const { host, port, user, pass } = config.smtp
const transporter = host
  ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  : null

// Called once on startup so a wrong password shows up immediately, not on the first student
export async function checkMail() {
  if (!transporter) return console.log('Mail: SMTP not set, emails will be printed here')
  try {
    await transporter.verify()
    console.log(`Mail: ready via ${host} as ${user}`)
  } catch (err) {
    console.error('Mail: SMTP login failed ->', err.message)
  }
}

// Without SMTP settings we just print the mail, so local dev works without email setup
export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`\n--- EMAIL (not sent, SMTP not set) ---\nTo: ${to}\n${subject}\n${text}\n`)
    return
  }
  await transporter.sendMail({ from: config.mailFrom, to, subject, text, html })
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
