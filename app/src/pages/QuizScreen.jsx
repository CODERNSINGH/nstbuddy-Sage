import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card } from '../components/ui.jsx'

const pad = (n) => String(n).padStart(2, '0')
const formatTime = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

export default function QuizScreen({ session, streams, onFinish, onScreenLost }) {
  const [quiz, setQuiz] = useState(null) // { questions, endsAt, clockOffset }
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
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
    const stopListening = window.desktop.onViolation(report)
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

  function choose(questionId, index) {
    const next = { ...answers, [questionId]: index }
    setAnswers(next)
    api('/progress', { method: 'PUT', body: { answers: next } }).catch(() => {}) // autosave
  }

  if (error) return <div className="grid min-h-screen place-items-center text-red-600">{error}</div>
  if (!quiz) return <div className="grid min-h-screen place-items-center">Loading exam...</div>

  const { questions } = quiz
  const question = questions[current]
  const answered = questions.filter((q) => answers[q.id] !== undefined).length
  const lowTime = timeLeft < 60 * 1000

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar: title, remaining time, warnings */}
      <header className="flex items-center justify-between bg-ink px-6 py-3 text-white">
        <div>
          <p className="font-bold">{session.contest.title}</p>
          <p className="text-xs text-slate-400">{session.student.name}</p>
        </div>
        <div className="flex items-center gap-6">
          {warnings > 0 && <span className="rounded bg-red-600 px-2 py-1 text-xs font-semibold">⚠ {warnings} warning(s)</span>}
          <div className={`rounded-lg px-4 py-1.5 font-mono text-xl font-bold ${lowTime ? 'bg-red-600' : 'bg-accent'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {warningText && (
        <div className="bg-red-50 px-6 py-2 text-sm text-red-700">
          {warningText}. This is recorded and your teacher can see it.
        </div>
      )}

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-6 lg:grid-cols-[1fr_280px]">
        {/* Question */}
        <Card className="flex flex-col">
          <p className="text-sm font-semibold text-brand">
            Question {current + 1} of {questions.length}
          </p>
          <h2 className="mt-2 text-xl font-bold">{question.text}</h2>

          <div className="mt-6 space-y-3">
            {question.options.map((option, i) => {
              const selected = answers[question.id] === i
              return (
                <button
                  key={i}
                  onClick={() => choose(question.id, i)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                    selected ? 'border-brand bg-brand-light' : 'border-slate-200 hover:border-brand/50'
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${selected ? 'bg-brand text-white' : 'bg-slate-100'}`}>
                    {'ABCD'[i]}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>

          <div className="mt-auto flex justify-between pt-8">
            <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
              ← Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent(current + 1)}>Next →</Button>
            ) : (
              <Button variant="green" onClick={() => setConfirming(true)}>Submit exam</Button>
            )}
          </div>
        </Card>

        {/* Side panel: camera + question map */}
        <aside className="space-y-4">
          <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-xl bg-black" />
          <Card className="p-4">
            <p className="mb-3 text-sm font-semibold">
              Question map <span className="font-normal text-slate-500">({answered}/{questions.length} answered)</span>
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-lg text-sm font-semibold ${
                    i === current
                      ? 'bg-brand text-white'
                      : answers[q.id] !== undefined
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button variant="dark" className="mt-4 w-full" onClick={() => setConfirming(true)}>
              Submit exam
            </Button>
          </Card>
        </aside>
      </div>

      {confirming && (
        <div className="fixed inset-0 grid place-items-center bg-black/60">
          <Card className="max-w-sm text-center">
            <h3 className="text-lg font-bold">Submit exam?</h3>
            <p className="mt-2 text-sm text-slate-500">
              You answered {answered} of {questions.length} questions. You cannot change answers after submitting.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setConfirming(false)}>Go back</Button>
              <Button variant="green" onClick={submit}>Yes, submit</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
