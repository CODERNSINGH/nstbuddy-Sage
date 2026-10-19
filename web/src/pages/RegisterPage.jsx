import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Button, Card, ErrorText, Field, Logo } from '../components/ui.jsx'

// Public page: students open the share link /c/:slug and sign up here
export default function RegisterPage() {
  const { slug } = useParams()
  const [contest, setContest] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', email: '', college: '', note: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api(`/public/contests/${slug}`)
      .then((d) => setContest(d.contest))
      .catch((err) => setError(err.message))
  }, [slug])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api(`/public/contests/${slug}/register`, { method: 'POST', body: form })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Card>
          <Logo />
          {!contest && <ErrorText>{error}</ErrorText>}
          {contest && (
            <>
              <p className="mt-6 text-sm font-semibold text-accent">{contest.clubName}</p>
              <h1 className="text-2xl font-bold">{contest.title}</h1>
              {contest.description && <p className="mt-1 text-slate-600">{contest.description}</p>}
              <p className="mt-2 text-sm text-slate-500">
                {contest.questionCount} questions · {contest.durationMinutes} minutes
              </p>

              {done ? (
                <div className="mt-6 rounded-xl bg-accent-light p-4 text-green-900">
                  <p className="font-bold">You are registered! 🎉</p>
                  <p className="mt-1 text-sm">
                    We emailed you a unique password. Open the NstBuddy Sage exam app on your Mac and login with your email
                    and that password.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <Field label="Full name" value={form.name} onChange={set('name')} required />
                  <Field label="Mobile number" type="tel" value={form.mobile} onChange={set('mobile')} required />
                  <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
                  <Field label="College name" value={form.college} onChange={set('college')} required />
                  <Field
                    label="Anything you want to share? (optional)"
                    as="textarea"
                    rows={3}
                    value={form.note}
                    onChange={set('note')}
                  />
                  <ErrorText>{error}</ErrorText>
                  <Button className="w-full" disabled={busy}>
                    {busy ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
