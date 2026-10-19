import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
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
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <Card className="w-full max-w-md">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">{isSignup ? 'Create your club account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSignup ? 'Host quizzes for your students.' : 'Login to manage your contests.'}
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
          <Button className="w-full" disabled={busy}>
            {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <Link className="font-semibold text-brand" to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Login' : 'Create an account'}
          </Link>
        </p>
      </Card>
    </div>
  )
}
