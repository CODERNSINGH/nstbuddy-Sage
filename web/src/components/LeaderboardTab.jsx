import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { Card } from './ui.jsx'

const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`

export default function LeaderboardTab({ contestId }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const load = () => api(`/contests/${contestId}/leaderboard`).then((d) => setRows(d.leaderboard))
    load()
    const timer = setInterval(load, 10000)
    return () => clearInterval(timer)
  }, [contestId])

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="bg-ink text-xs uppercase text-white">
          <tr>
            {['Rank', 'Name', 'College', 'Score', 'Time', 'Warnings'].map((h) => (
              <th key={h} className="px-4 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.email} className="border-t border-slate-100">
              <td className="px-4 py-2 font-bold text-brand">{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</td>
              <td className="px-4 py-2 font-medium">{r.name}</td>
              <td className="px-4 py-2">{r.college}</td>
              <td className="px-4 py-2 font-semibold text-accent">{r.score}/{r.total}</td>
              <td className="px-4 py-2">{formatTime(r.secondsTaken)}</td>
              <td className="px-4 py-2">{r.violations}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No submissions yet.</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  )
}
