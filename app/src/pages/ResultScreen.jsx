import { Button, Card } from '../components/ui.jsx'

export default function ResultScreen({ result, onExit }) {
  const percent = Math.round((result.score / result.total) * 100)
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="bg-ink text-center text-white">
          <p className="text-slate-400">Your score</p>
          <p className="mt-2 text-6xl font-black text-accent">
            {result.score}
            <span className="text-3xl text-white"> / {result.total}</span>
          </p>
          <p className="mt-2 text-slate-300">{percent}% correct</p>
          <Button className="mt-5" onClick={onExit}>Close app</Button>
        </Card>

        <h2 className="text-lg font-bold">Review</h2>
        {result.review.map((q, i) => (
          <Card key={i} className="p-5">
            <p className="font-semibold">{i + 1}. {q.text}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {q.options.map((option, j) => {
                const isCorrect = j === q.correctIndex
                const isYours = j === q.yourIndex
                return (
                  <li
                    key={j}
                    className={`rounded-lg px-3 py-2 ${
                      isCorrect ? 'bg-accent-light font-semibold text-green-800' : isYours ? 'bg-red-50 text-red-700' : 'text-slate-600'
                    }`}
                  >
                    {'ABCD'[j]}. {option} {isCorrect && '✓'} {isYours && !isCorrect && '(your answer)'}
                  </li>
                )
              })}
            </ul>
            {q.yourIndex === null && <p className="mt-2 text-xs text-slate-500">You skipped this one.</p>}
            {q.explanation && <p className="mt-3 rounded-lg bg-brand-light p-3 text-sm text-brand-dark">{q.explanation}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
