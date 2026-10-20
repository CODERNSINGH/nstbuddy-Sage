import { CheckCircle2, ClipboardList, Clock, HelpCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { DOWNLOAD_URL } from '../lib/config.js'
import Banner from '../components/Banner.jsx'
import DownloadCard from '../components/DownloadCard.jsx'
import { Button, Card, ErrorText, Field, IconBox, Label, Logo } from '../components/ui.jsx'

// Public page: students open the share link /c/:slug and sign up here
export default function RegisterPage() {
  const { slug } = useParams()
  const [contest, setContest] = useState(null)
  const [already, setAlready] = useState(false) // email was registered before
  const [form, setForm] = useState({ name: '', mobile: '', email: '', college: '', note: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [emailSent, setEmailSent] = useState(true)
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
      const res = await api(`/public/contests/${slug}/register`, { method: 'POST', body: form })
      setEmailSent(res.emailSent !== false)
      setDone(true)
    } catch (err) {
      setError(err.message)
      if (err.status === 409) setAlready(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex justify-center"><Logo className="h-8" /></div>

        <Card className="p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          {!contest && (error ? <ErrorText>{error}</ErrorText> : <p className="text-slate-500">Loading...</p>)}

          {contest && (
            <>
              <Banner icon={ClipboardList} />
              <div className="mt-6">
                <Label>{contest.clubName}</Label>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{contest.title}</h1>
                {contest.description && <p className="mt-2 text-slate-600">{contest.description}</p>}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconBox icon={Clock} />
                  <div><Label>Duration</Label><p className="font-bold">{contest.durationMinutes} min</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <IconBox icon={HelpCircle} />
                  <div><Label>Questions</Label><p className="font-bold">{contest.questionCount}</p></div>
                </div>
              </div>

              <hr className="my-7 border-line" />

              {done ? (
                <div className="rounded-2xl bg-accent-soft p-6 text-center">
                  <CheckCircle2 className="mx-auto text-accent" size={40} />
                  <p className="mt-3 text-xl font-bold text-accent-dark">You are registered!</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {emailSent
                      ? 'We emailed you a unique password (check spam too). Download the app below, open it and login with your email and that password.'
                      : 'Your password email has not gone out yet. We keep retrying automatically, and your teacher can resend it too. You can already download the app below.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Field label="Full name" value={form.name} onChange={set('name')} required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Mobile number" type="tel" value={form.mobile} onChange={set('mobile')} required />
                    <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
                  </div>
                  <Field label="College name" value={form.college} onChange={set('college')} required />
                  <Field label="Anything you want to share? (optional)" as="textarea" rows={3} value={form.note} onChange={set('note')} />
                  <ErrorText>{error}</ErrorText>
                  <Button variant="green" size="lg" className="w-full" disabled={busy}>
                    {busy ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              )}

              {(done || already) && (
                <div className="mt-8 border-t border-line pt-7">
                  <DownloadCard />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
