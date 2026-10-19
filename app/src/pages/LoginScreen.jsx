import { useState } from 'react'
import { api, setToken } from '../lib/api.js'
import { Button, Card, Logo } from '../components/ui.jsx'

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

  const input = 'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <Card className="w-full max-w-md">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">Student exam login</h1>
        <p className="mt-1 text-sm text-slate-500">Use the email and password we sent to your inbox.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input className={`${input} font-mono uppercase`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="XXXX-XXXX-XXXX" required />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button className="w-full" disabled={busy}>
            {busy ? 'Checking...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
