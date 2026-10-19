import { Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card, Pill } from './ui.jsx'

const tones = { registered: 'gray', writing: 'amber', submitted: 'green' }

// Refreshes every 5 seconds so the teacher sees signups arrive "live"
export default function StudentsTab({ contestId }) {
  const [students, setStudents] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = () => api(`/contests/${contestId}/registrations`).then((d) => setStudents(d.registrations))
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [contestId])

  async function resend(id) {
    await api(`/contests/${contestId}/registrations/${id}/resend`, { method: 'POST' })
    setMessage('Password email sent')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-line p-5">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">{students.length} registered</h3>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Live
          </span>
        </div>
        <span className="text-sm font-medium text-accent-dark">{message}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
            <tr>
              {['Name', 'Email', 'Mobile', 'College', 'Status', 'Score', ''].map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-line hover:bg-slate-50/60" title={s.note}>
                <td className="px-5 py-3 font-semibold">{s.name}</td>
                <td className="px-5 py-3 text-slate-600">{s.email}</td>
                <td className="px-5 py-3 text-slate-600">{s.mobile}</td>
                <td className="px-5 py-3 text-slate-600">{s.college}</td>
                <td className="px-5 py-3"><Pill tone={tones[s.status]}>{s.status}</Pill></td>
                <td className="px-5 py-3 font-semibold">{s.score === null ? '-' : `${s.score}/${s.total}`}</td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => resend(s.id)}><Mail size={14} /> Resend</Button>
                </td>
              </tr>
            ))}
            {!students.length && (
              <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500">Nobody yet. Share the link!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
