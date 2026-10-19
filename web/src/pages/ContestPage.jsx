import { ArrowLeft, Check, Clock, Copy, HelpCircle, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Button, Card, Pill } from '../components/ui.jsx'
import LeaderboardTab from '../components/LeaderboardTab.jsx'
import MonitorTab from '../components/MonitorTab.jsx'
import QuestionsTab from '../components/QuestionsTab.jsx'
import StudentsTab from '../components/StudentsTab.jsx'

const TABS = ['Questions', 'Students', 'Monitor', 'Leaderboard']

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
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink">
        <ArrowLeft size={16} /> All contests
      </Link>

      <Card className="p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{contest.title}</h1>
            {contest.description && <p className="mt-1 text-slate-600">{contest.description}</p>}
            <div className="mt-3 flex gap-2">
              <Pill tone="gray"><Clock size={12} className="mr-1 inline" />{contest.durationMinutes} min</Pill>
              <Pill tone="blue"><HelpCircle size={12} className="mr-1 inline" />{questions.length} questions</Pill>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={remove}><Trash2 size={14} /> Delete</Button>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Share this link with students</p>
          <div className="flex gap-2">
            <input readOnly value={shareLink} className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm" />
            <Button variant={copied ? 'green' : 'dark'} onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Segmented tabs, same style as "Campuses / Other Courses" on the main site */}
      <div className="inline-flex rounded-2xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Questions' && <QuestionsTab contestId={id} questions={questions} reload={load} />}
      {tab === 'Students' && <StudentsTab contestId={id} />}
      {tab === 'Monitor' && <MonitorTab contestId={id} />}
      {tab === 'Leaderboard' && <LeaderboardTab contestId={id} />}
    </div>
  )
}
