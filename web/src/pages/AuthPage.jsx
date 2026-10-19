import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import HeroCards from '../components/HeroCards.jsx'
import { Button, Card, ErrorText, Field, Logo } from '../components/ui.jsx'

// One page used for both /login and /signup
export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', clubName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await (isSignup ? signup(form) : login(form.email, form.password))
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-2">
      {/* Left: hero */}
      <section>
        <Logo className="h-8" />
        <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
          <Sparkles size={14} /> Quiz contests for clubs & classes
        </span>
        <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Host smarter.
          <br />
          <span className="text-brand">Together.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-slate-600">
          Create a quiz, share one link, and watch students register live. Proctored exams, instant scores, a leaderboard.
        </p>
        <div className="mt-10">
          <HeroCards />
        </div>
      </section>

      {/* Right: form */}
      <Card className="w-full max-w-md justify-self-center p-8 shadow-xl shadow-slate-200/60 lg:justify-self-end">
        <h2 className="text-2xl font-bold tracking-tight">{isSignup ? 'Create your club account' : 'Welcome back'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {isSignup ? 'Takes less than a minute.' : 'Login to manage your contests.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {isSignup && (
            <>
              <Field label="Your name" value={form.name} onChange={set('name')} required />
              <Field label="Club / class name" value={form.clubName} onChange={set('clubName')} required />
            </>
          )}
          <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} required />
          <ErrorText>{error}</ErrorText>
          <Button size="lg" className="w-full" disabled={busy}>
            {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <Link className="font-semibold text-brand" to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Login' : 'Create an account'}
          </Link>
        </p>
      </Card>
    </div>
  )
}
