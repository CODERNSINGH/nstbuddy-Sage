import { Check, X } from 'lucide-react'
import { Button, Card, Label } from '../components/ui.jsx'

// Circular score meter
function ScoreRing({ percent }) {
  const r = 70
  const circumference = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 180 180" className="h-44 w-44 -rotate-90">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#e8eaee" strokeWidth="14" />
      <circle cx="90" cy="90" r={r} fill="none" stroke="#2f9e63" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} />
    </svg>
  )
}

export default function ResultScreen({ result, onExit }) {
  const percent = Math.round((result.score / result.total) * 100)
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="flex flex-col items-center p-10 text-center shadow-xl shadow-slate-200/60">
          <Label>Quiz submitted</Label>
          <div className="relative mt-4">
            <ScoreRing percent={percent} />
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <p className="text-5xl font-extrabold">{result.score}</p>
                <p className="text-slate-500">out of {result.total}</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold">{percent}% correct</p>
          <Button variant="dark" size="lg" className="mt-6" onClick={onExit}>Close app</Button>
        </Card>

        <h2 className="text-xl font-bold tracking-tight">Review</h2>
        {result.review.map((q, i) => (
          <Card key={i} className="p-6">
            <Label>Question {i + 1}</Label>
            <p className="mt-1 text-lg font-bold">{q.text}</p>
            <ul className="mt-4 space-y-2">
              {q.options.map((option, j) => {
                const isCorrect = j === q.correctIndex
                const isYours = j === q.yourIndex
                const style = isCorrect
                  ? 'border-accent/40 bg-accent-soft'
                  : isYours
                    ? 'border-red-200 bg-red-50'
                    : 'border-line'
                return (
                  <li key={j} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${style}`}>
                    <span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-white text-sm">{'ABCD'[j]}</span>
                    <span className="flex-1">{option}</span>
                    {isCorrect && <Check size={18} className="text-accent" />}
                    {isYours && !isCorrect && <X size={18} className="text-red-500" />}
                  </li>
                )
              })}
            </ul>
            {q.yourIndex === null && <p className="mt-3 text-xs text-slate-500">You skipped this one.</p>}
            {q.explanation && <p className="mt-4 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">{q.explanation}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
