import { useState } from 'react'
import { api, setToken } from '../lib/api.js'
import { Button, Card, ErrorText, Field, Logo } from '../components/ui.jsx'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api('/login', { method: 'POST', body: { email, password } })
      setToken(data.token)
      onLogin({ student: data.student, contest: data.contest })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-soft via-white to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo className="h-10" /></div>
        <Card className="p-8 shadow-xl shadow-slate-200/60">
          <h1 className="text-2xl font-extrabold tracking-tight">Student exam login</h1>
          <p className="mt-1 text-sm text-slate-500">Use the email and password we sent to your inbox.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field
              label="Password"
              className="font-mono uppercase tracking-wider"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              required
            />
            <ErrorText>{error}</ErrorText>
            <Button variant="green" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Checking...' : 'Login'}
            </Button>
          </form>
        </Card>
        <p className="mt-5 text-center text-xs text-slate-400">Proctored exam. Screen and camera will be required.</p>
      </div>
    </div>
  )
}
