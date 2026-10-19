import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Button, Card } from '../components/ui.jsx'
import QuestionsTab from '../components/QuestionsTab.jsx'
import StudentsTab from '../components/StudentsTab.jsx'
import LeaderboardTab from '../components/LeaderboardTab.jsx'

const TABS = ['Questions', 'Students', 'Leaderboard']

export default function ContestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('Questions')
  const [copied, setCopied] = useState(false)

  const load = useCallback(() => api(`/contests/${id}`).then(setData), [id])
  useEffect(() => {
    load().catch(() => navigate('/'))
  }, [load, navigate])

  if (!data) return <p className="text-slate-500">Loading...</p>
  const { contest, questions } = data
  const shareLink = `${window.location.origin}/c/${contest.slug}`

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function remove() {
    if (!confirm('Delete this contest and all its data?')) return
    await api(`/contests/${id}`, { method: 'DELETE' })
    navigate('/')
  }

  return (
    <div className="space-y-5">
      <Link to="/" className="text-sm text-brand">← All contests</Link>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-brand">
        <div>
          <h1 className="text-2xl font-bold">{contest.title}</h1>
          <p className="text-sm text-slate-500">{contest.durationMinutes} minutes · {questions.length} questions</p>
        </div>
        <div className="flex items-center gap-2">
          <input readOnly value={shareLink} className="w-64 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm" />
          <Button variant="green" onClick={copyLink}>{copied ? 'Copied!' : 'Copy link'}</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === t ? 'border-brand text-brand' : 'border-transparent text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Questions' && <QuestionsTab contestId={id} questions={questions} reload={load} />}
      {tab === 'Students' && <StudentsTab contestId={id} />}
      {tab === 'Leaderboard' && <LeaderboardTab contestId={id} />}
    </div>
  )
}
