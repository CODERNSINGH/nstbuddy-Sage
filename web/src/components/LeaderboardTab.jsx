import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { Card } from './ui.jsx'

const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`
const podium = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-700']

export default function LeaderboardTab({ contestId }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const load = () => api(`/contests/${contestId}/leaderboard`).then((d) => setRows(d.leaderboard))
    load()
    const timer = setInterval(load, 10000)
    return () => clearInterval(timer)
  }, [contestId])

  if (!rows.length) return <Card className="py-14 text-center text-slate-500">No submissions yet.</Card>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {rows.slice(0, 3).map((r) => (
          <div key={r.email} className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-md ${podium[r.rank - 1]}`}>
            <p className="text-sm font-bold opacity-90">#{r.rank}</p>
            <p className="mt-3 truncate text-lg font-bold">{r.name}</p>
            <p className="truncate text-sm opacity-80">{r.college}</p>
            <p className="mt-3 text-3xl font-extrabold">{r.score}<span className="text-base opacity-80">/{r.total}</span></p>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                {['Rank', 'Name', 'College', 'Score', 'Time', 'Warnings'].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-t border-line">
                  <td className="px-5 py-3 font-bold text-brand">{r.rank}</td>
                  <td className="px-5 py-3 font-semibold">{r.name}</td>
                  <td className="px-5 py-3 text-slate-600">{r.college}</td>
                  <td className="px-5 py-3 font-bold text-accent-dark">{r.score}/{r.total}</td>
                  <td className="px-5 py-3 text-slate-600">{formatTime(r.secondsTaken)}</td>
                  <td className="px-5 py-3">{r.violations ? <span className="font-semibold text-red-600">{r.violations}</span> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
