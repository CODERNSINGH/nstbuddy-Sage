import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Button, Card, ErrorText, Field } from '../components/ui.jsx'

export default function Dashboard() {
  const [contests, setContests] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', durationMinutes: 30 })
  const [error, setError] = useState('')

  const load = () => api('/contests').then((d) => setContests(d.contests))
  useEffect(() => {
    load()
  }, [])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/contests', { method: 'POST', body: { ...form, durationMinutes: Number(form.durationMinutes) } })
      setForm({ title: '', description: '', durationMinutes: 30 })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <section>
        <h2 className="mb-3 text-xl font-bold">Your contests</h2>
        {contests === null && <p className="text-slate-500">Loading...</p>}
        {contests?.length === 0 && (
          <Card className="text-center text-slate-500">No contests yet. Create your first one 👉</Card>
        )}
        <div className="space-y-3">
          {contests?.map((c) => (
            <Link key={c.id} to={`/contests/${c.id}`} className="block">
              <Card className="transition hover:border-brand">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-sm text-slate-500">{c.durationMinutes} min</p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-brand-light px-3 py-1 text-brand">{c.questionCount} questions</span>
                    <span className="rounded-full bg-accent-light px-3 py-1 text-accent">{c.studentCount} students</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="h-fit">
        <h2 className="mb-3 text-lg font-bold">New contest</h2>
        <form onSubmit={create} className="space-y-3">
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Field
            label="Description (optional)"
            as="textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Field
            label="Duration (minutes)"
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
          />
          <ErrorText>{error}</ErrorText>
          <Button variant="green" className="w-full">
            Create contest
          </Button>
        </form>
      </Card>
    </div>
  )
}
