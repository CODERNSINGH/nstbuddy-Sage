import { Mail, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card, IconBox, Pill } from './ui.jsx'

const modeLabel = { smtp: 'SMTP', resend: 'Resend (HTTPS)', none: 'Not set up' }

// Shows how emails are configured and lets the admin send themselves a test mail.
export default function MailSetupCard() {
  const [info, setInfo] = useState(null)
  const [result, setResult] = useState(null) // { ok, text, hint }
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/mail/status').then(setInfo).catch(() => {}) // old backend without this route: card stays hidden
  }, [])

  async function sendTest() {
    setBusy(true)
    setResult(null)
    try {
      const res = await api('/mail/test', { method: 'POST' })
      setResult({ ok: true, text: `Test email sent to ${res.to}. Check your inbox (and spam).` })
    } catch (err) {
      setResult({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (!info) return null
  const problem = info.mode === 'none' || info.smtpPortBlockedOnRender

  return (
    <Card className="mt-6 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <IconBox icon={Mail} className={problem ? 'bg-amber-50 text-amber-600' : 'bg-brand-soft text-brand'} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-bold">
            Email setup <Pill tone={problem ? 'amber' : 'green'}>{modeLabel[info.mode]}</Pill>
          </p>
          <p className="text-sm text-slate-500">
            {info.mode === 'none'
              ? 'No mail provider is configured, so students will not receive their passwords.'
              : `Sending from ${info.from}${info.host ? ` via ${info.host}` : ''}.`}
          </p>
        </div>
        <Button variant="dark" onClick={sendTest} disabled={busy}>
          <Send size={16} /> {busy ? 'Sending...' : 'Send test email to me'}
        </Button>
      </div>

      {info.smtpPortBlockedOnRender && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          Render's free plan blocks this SMTP port. Set <b>RESEND_API_KEY</b> (works over HTTPS), or use an SMTP provider on port 2525.
        </p>
      )}
      {result && (
        <p className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm ${result.ok ? 'bg-accent-soft text-accent-dark' : 'bg-red-50 text-red-700'}`}>
          {result.text}
        </p>
      )}
    </Card>
  )
}
