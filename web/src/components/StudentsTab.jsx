import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card } from './ui.jsx'

const badge = {
  registered: 'bg-slate-100 text-slate-600',
  writing: 'bg-amber-100 text-amber-700',
  submitted: 'bg-accent-light text-accent',
}

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
    setMessage('Password email sent again')
  }

  return (
    <Card className="overflow-x-auto p-0">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-bold">
          {students.length} registered <span className="ml-2 text-xs font-normal text-accent">● live</span>
        </h3>
        <span className="text-sm text-accent">{message}</span>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {['Name', 'Email', 'Mobile', 'College', 'Status', 'Score', ''].map((h) => (
              <th key={h} className="px-4 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-t border-slate-100" title={s.note}>
              <td className="px-4 py-2 font-medium">{s.name}</td>
              <td className="px-4 py-2">{s.email}</td>
              <td className="px-4 py-2">{s.mobile}</td>
              <td className="px-4 py-2">{s.college}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[s.status]}`}>{s.status}</span>
              </td>
              <td className="px-4 py-2">{s.score === null ? '-' : `${s.score}/${s.total}`}</td>
              <td className="px-4 py-2">
                <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => resend(s.id)}>
                  Resend mail
                </Button>
              </td>
            </tr>
          ))}
          {!students.length && (
            <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">Nobody yet. Share the link!</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  )
}
