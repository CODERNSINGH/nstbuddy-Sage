import { ChevronLeft, ChevronRight, LayoutGrid, Timer } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { desktop } from '../lib/desktop.js'
import { Button, Card, Label } from '../components/ui.jsx'

const pad = (n) => String(n).padStart(2, '0')
const formatTime = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

export default function QuizScreen({ session, streams, onFinish, onScreenLost }) {
  const [quiz, setQuiz] = useState(null) // { questions, endsAt, clockOffset }
  const [answers, setAnswers] = useState({}) // { questionId: optionIndex }
  const [viewed, setViewed] = useState(new Set([0]))
  const [marked, setMarked] = useState(new Set()) // question ids marked for review
  const [current, setCurrent] = useState(0)
  const [showMap, setShowMap] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [warnings, setWarnings] = useState(0)
  const [warningText, setWarningText] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const videoRef = useRef(null)

  // Load questions + start the server timer
  useEffect(() => {
    api('/start', { method: 'POST' })
      .then((d) => {
        setQuiz({ questions: d.questions, endsAt: d.endsAt, clockOffset: d.serverNow - Date.now() })
        setAnswers(d.answers || {})
      })
      .catch((err) => setError(err.message))
  }, [])

  const submit = useCallback(async () => {
    if (submitting.current) return
    submitting.current = true
    try {
      onFinish(await api('/submit', { method: 'POST', body: { answers } }))
    } catch (err) {
      submitting.current = false
      setError(err.message)
    }
  }, [answers, onFinish])

  // Countdown (uses the server's clock so changing the Mac clock does not help)
  useEffect(() => {
    if (!quiz) return
    const tick = () => {
      const left = quiz.endsAt - (Date.now() + quiz.clockOffset)
      setTimeLeft(left)
      if (left <= 0) submit()
    }
    tick()
    const timer = setInterval(tick, 500)
    return () => clearInterval(timer)
  }, [quiz, submit])

  // Warnings from the desktop app (left window / left full screen) + screen share stopping
  useEffect(() => {
    const report = (reason) => {
      setWarnings((w) => w + 1)
      setWarningText(reason)
      api('/violation', { method: 'POST' }).catch(() => {})
    }
    const stopListening = desktop.onViolation(report)
    const screenTrack = streams.screen.getVideoTracks()[0]
    const onEnded = () => {
      report('Screen sharing stopped')
      onScreenLost()
    }
    screenTrack.addEventListener('ended', onEnded)
    return () => {
      stopListening()
      screenTrack.removeEventListener('ended', onEnded)
    }
  }, [streams, onScreenLost])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = streams.camera
  }, [streams, quiz])

  const goTo = (index) => {
    setCurrent(index)
    setViewed((v) => new Set(v).add(index))
  }

  function saveAnswers(next) {
    setAnswers(next)
    api('/progress', { method: 'PUT', body: { answers: next } }).catch(() => {}) // autosave
  }

  const toggleMark = (id) =>
    setMarked((m) => {
      const next = new Set(m)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  if (error) return <div className="grid min-h-screen place-items-center text-red-600">{error}</div>
  if (!quiz) return <div className="grid min-h-screen place-items-center text-slate-500">Loading exam...</div>

  const { questions } = quiz
  const question = questions[current]
  const isMarked = marked.has(question.id)
  const answered = questions.filter((q) => answers[q.id] !== undefined).length
  const lowTime = timeLeft < 60 * 1000

  // Palette tile colour: current > attempted > viewed > untouched
  const tileStyle = (q, i) => {
    if (i === current) return 'border-brand bg-brand-soft text-brand'
    if (answers[q.id] !== undefined) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    if (viewed.has(i)) return 'border-amber-200 bg-amber-50 text-amber-700'
    return 'border-line bg-white text-slate-600'
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-line px-8 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{session.contest.title}</h1>
          <p className="text-xs text-slate-500">{session.student.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {warnings > 0 && <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">⚠ {warnings} warning{warnings > 1 && 's'}</span>}
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold ${lowTime ? 'bg-red-50 text-red-600' : 'bg-slate-100'}`}>
            <Timer size={18} /> {formatTime(timeLeft)}
          </div>
          <video ref={videoRef} autoPlay muted playsInline className="h-11 w-14 rounded-lg bg-black object-cover" title="Camera" />
          <Button variant="green" size="lg" className="!py-2.5" onClick={() => setConfirming(true)}>Submit Quiz</Button>
        </div>
      </header>

      {warningText && (
        <div className="bg-red-50 px-8 py-2 text-sm text-red-700">{warningText}. This is recorded and your teacher can see it.</div>
      )}

      {/* Question area */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Question {current + 1}/{questions.length}</p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleMark(question.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  isMarked ? 'border-violet-600 bg-violet-600 text-white' : 'border-line bg-white text-violet-700 hover:bg-violet-50'
                }`}
              >
                {isMarked ? 'Unmark' : 'Mark for review'}
              </button>
              <button
                disabled={answers[question.id] === undefined}
                onClick={() => {
                  const next = { ...answers }
                  delete next[question.id]
                  saveAnswers(next)
                }}
                className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Clear Selection
              </button>
            </div>
          </div>

          <h2 className="mt-5 text-2xl font-bold leading-snug sm:text-[1.65rem]">{question.text}</h2>

          <div className="mt-8 space-y-3.5">
            {question.options.map((option, i) => {
              // Options are shuffled by the server; answers are stored by ORIGINAL index
              const original = question.order[i]
              const selected = answers[question.id] === original
              return (
                <button
                  key={i}
                  onClick={() => saveAnswers({ ...answers, [question.id]: original })}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left text-lg transition ${
                    selected ? 'border-brand bg-brand-soft' : 'border-line hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-base font-medium ${selected ? 'border-brand bg-brand text-white' : 'border-line bg-white'}`}>
                    {'ABCD'[i]}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Bottom: question map + navigation */}
      <footer className="border-t border-line bg-white px-8 pb-5 pt-4">
        <div className="mx-auto max-w-4xl">
          {showMap && (
            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap gap-2.5">
                {questions.map((q, i) => (
                  <button key={q.id} onClick={() => goTo(i)} className={`relative h-11 w-11 rounded-xl border text-base font-semibold transition ${tileStyle(q, i)}`}>
                    {i + 1}
                    {marked.has(q.id) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-violet-600" />}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
                <Legend className="border-emerald-200 bg-emerald-50" text="Attempted" />
                <Legend className="border-amber-200 bg-amber-50" text="Viewed" />
                <Legend className="border-brand bg-brand-soft" text="Current Question" />
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-600" /> Marked for Review</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="lg" disabled={current === 0} onClick={() => goTo(current - 1)}>
              <ChevronLeft size={18} /> Previous
            </Button>
            <button onClick={() => setShowMap(!showMap)} title="Question map" className={`grid h-12 w-12 place-items-center rounded-xl ${showMap ? 'bg-slate-200' : 'bg-slate-100'} hover:bg-slate-200`}>
              <LayoutGrid size={20} />
            </button>
            <Button variant="dark" size="lg" disabled={current === questions.length - 1} onClick={() => goTo(current + 1)}>
              Next <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </footer>

      {confirming && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-ink/60 p-4">
          <Card className="w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold">Submit Quiz?</h3>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Summary label="Answered" value={answered} tone="text-accent-dark" />
              <Summary label="Not answered" value={questions.length - answered} tone="text-amber-600" />
              <Summary label="For review" value={marked.size} tone="text-violet-600" />
            </div>
            <p className="mt-4 text-sm text-slate-500">You cannot change your answers after submitting.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirming(false)}>Go back</Button>
              <Button variant="green" onClick={submit}>Yes, submit</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const Legend = ({ className, text }) => (
  <span className="flex items-center gap-2"><span className={`h-5 w-5 rounded-full border ${className}`} /> {text}</span>
)

const Summary = ({ label, value, tone }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
    <Label>{label}</Label>
  </div>
)
