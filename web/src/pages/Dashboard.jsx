import { BookOpen, Check, Clock, Copy, Download, Plus, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import MailSetupCard from '../components/MailSetupCard.jsx'
import NewContestModal from '../components/NewContestModal.jsx'
import { Button, Card, IconBox, Pill } from '../components/ui.jsx'

// Blue / green / dark banners cycle so the grid feels alive
const banners = ['from-brand to-blue-900', 'from-accent to-emerald-800', 'from-slate-700 to-ink']

export default function Dashboard() {
  const { admin } = useAuth()
  const [contests, setContests] = useState(null)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const downloadLink = `${window.location.origin}/d/${admin.downloadSlug}`

  async function copyDownloadLink() {
    await navigator.clipboard.writeText(downloadLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const load = () => api('/contests').then((d) => setContests(d.contests))
  useEffect(() => {
    load()
  }, [])

  const sum = (key) => (contests || []).reduce((total, c) => total + c[key], 0)
  const stats = [
    { icon: Trophy, value: contests?.length ?? 0, label: 'Contests' },
    { icon: BookOpen, value: sum('questionCount'), label: 'Questions' },
    { icon: Users, value: sum('studentCount'), label: 'Students' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">Hi {admin.name.split(' ')[0]} 👋</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Your contests</h1>
        </div>
        <Button variant="green" size="lg" onClick={() => setCreating(true)}>
          <Plus size={18} /> New contest
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {stats.map(({ icon, value, label }) => (
          <Card key={label} className="flex items-center gap-4 p-5">
            <IconBox icon={icon} className="bg-brand-soft text-brand" />
            <div>
              <p className="text-2xl font-extrabold leading-none">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {admin.downloadSlug && (
      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        <IconBox icon={Download} className="bg-accent-soft text-accent" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">App download link</p>
          <p className="text-sm text-slate-500">Share anytime. Opens a page where students can only download the Mac app (Apple Silicon).</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <input readOnly value={downloadLink} className="min-w-0 flex-1 rounded-xl border border-line bg-slate-50 px-3.5 py-2.5 text-sm sm:w-72" />
          <Button variant={copied ? 'green' : 'dark'} onClick={copyDownloadLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Card>
      )}

      <MailSetupCard />

      <h2 className="mb-4 mt-12 text-xl font-bold tracking-tight">All contests</h2>
      {contests === null && <p className="text-slate-500">Loading...</p>}
      {contests?.length === 0 && (
        <Card className="py-14 text-center">
          <p className="text-lg font-semibold">No contests yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first quiz and share the link with students.</p>
          <Button className="mt-5" onClick={() => setCreating(true)}><Plus size={16} /> New contest</Button>
        </Card>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contests?.map((c, i) => (
          <Link key={c.id} to={`/contests/${c.id}`} className="group">
            <Card className="overflow-hidden p-0 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <div className={`h-24 bg-gradient-to-br p-4 ${banners[i % banners.length]}`}>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                  <Clock size={12} className="mr-1 inline" />
                  {c.durationMinutes} min
                </span>
              </div>
              <div className="p-5">
                <h3 className="truncate font-bold">{c.title}</h3>
                <div className="mt-3 flex gap-2">
                  <Pill tone="blue">{c.questionCount} {c.questionCount === 1 ? 'question' : 'questions'}</Pill>
                  <Pill tone="green">{c.studentCount} {c.studentCount === 1 ? 'student' : 'students'}</Pill>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {creating && (
        <NewContestModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            load()
          }}
        />
      )}
    </div>
  )
}
