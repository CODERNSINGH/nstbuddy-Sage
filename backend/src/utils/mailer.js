import nodemailer from 'nodemailer'
import { config } from '../config.js'

const { host, port, user, pass } = config.smtp
const transporter = host
  ? nodemailer.createTransport({ host, port, auth: { user, pass } })
  : null

// Without SMTP settings we just print the mail, so local dev works without email setup
export async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.log(`\n--- EMAIL (not sent, SMTP not set) ---\nTo: ${to}\n${subject}\n${text}\n`)
    return
  }
  await transporter.sendMail({ from: config.mailFrom, to, subject, text })
}

export function sendCredentials({ registration, contest }) {
  return sendMail({
    to: registration.email,
    subject: `You are registered for ${contest.title}`,
    text: [
      `Hi ${registration.name},`,
      ``,
      `You are registered for "${contest.title}".`,
      `Open the NstBuddy Sage exam app and login with:`,
      ``,
      `Email:    ${registration.email}`,
      `Password: ${registration.access_code}`,
      ``,
      `Duration: ${contest.duration_minutes} minutes. Keep this password private.`,
    ].join('\n'),
  })
}
