import { X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card, ErrorText, Field } from './ui.jsx'

export default function NewContestModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', durationMinutes: 30 })
  const [error, setError] = useState('')

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/contests', { method: 'POST', body: { ...form, durationMinutes: Number(form.durationMinutes) } })
      onCreated()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">New contest</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={create} className="mt-5 space-y-4">
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          <Field label="Description (optional)" as="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Field label="Duration (minutes)" type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
          <ErrorText>{error}</ErrorText>
          <Button variant="green" size="lg" className="w-full">Create contest</Button>
        </form>
      </Card>
    </div>
  )
}
