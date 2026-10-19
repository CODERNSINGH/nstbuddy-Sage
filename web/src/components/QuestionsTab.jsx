import { Check, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card, ErrorText, Field, Label } from './ui.jsx'

const emptyForm = { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }

// The JSON pattern admins can paste to add many questions at once
const SAMPLE_JSON = `[
  {
    "text": "What is 2 + 2?",
    "options": ["1", "2", "3", "4"],
    "correctIndex": 3,
    "explanation": "Two plus two is four."
  }
]`

export default function QuestionsTab({ contestId, questions, reload }) {
  const [form, setForm] = useState(emptyForm)
  const [json, setJson] = useState('')
  const [error, setError] = useState('')

  const base = `/contests/${contestId}/questions`

  async function addOne(e) {
    e.preventDefault()
    setError('')
    try {
      await api(base, { method: 'POST', body: form })
      setForm(emptyForm)
      reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function addJson() {
    setError('')
    try {
      const parsed = JSON.parse(json)
      await api(base, { method: 'POST', body: { questions: Array.isArray(parsed) ? parsed : parsed.questions } })
      setJson('')
      reload()
    } catch (err) {
      setError(err instanceof SyntaxError ? 'That is not valid JSON' : err.message)
    }
  }

  async function remove(id) {
    await api(`${base}/${id}`, { method: 'DELETE' })
    reload()
  }

  const setOption = (i, value) => {
    const options = [...form.options]
    options[i] = value
    setForm({ ...form, options })
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-bold">Add a question</h3>
          <form onSubmit={addOne} className="mt-4 space-y-4">
            <Field label="Question" as="textarea" rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
            <div className="space-y-2">
              <Label>Options (tick the correct one)</Label>
              {form.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: i })}
                    title="Mark as correct"
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-bold ${
                      form.correctIndex === i ? 'border-accent bg-accent text-white' : 'border-line text-slate-500'
                    }`}
                  >
                    {form.correctIndex === i ? <Check size={16} /> : 'ABCD'[i]}
                  </button>
                  <input
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                    placeholder={`Option ${'ABCD'[i]}`}
                    value={option}
                    onChange={(e) => setOption(i, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <Field label="Explanation" as="textarea" rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            <Button variant="green">Add question</Button>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-bold">Or paste JSON</h3>
          <p className="mt-1 text-sm text-slate-500">Add many questions at once using this pattern:</p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-emerald-300">{SAMPLE_JSON}</pre>
          <textarea
            className="mt-3 h-32 w-full rounded-xl border border-line p-3 font-mono text-xs outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste JSON here"
          />
          <Button className="mt-3" onClick={addJson} disabled={!json.trim()}>Import JSON</Button>
        </Card>
        <ErrorText>{error}</ErrorText>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">{questions.length} questions</h3>
        {!questions.length && <Card className="text-center text-sm text-slate-500">No questions yet. Add one on the left.</Card>}
        {questions.map((q, i) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold"><span className="mr-2 text-brand">Q{i + 1}</span>{q.text}</p>
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => remove(q.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {q.options.map((o, j) => (
                <li
                  key={j}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                    j === q.correctIndex ? 'border-accent/30 bg-accent-soft font-semibold text-accent-dark' : 'border-line text-slate-600'
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-line bg-white text-xs font-bold text-ink">{'ABCD'[j]}</span>
                  {o}
                </li>
              ))}
            </ul>
            {q.explanation && <p className="mt-3 rounded-xl bg-brand-soft p-3 text-sm text-brand-dark">{q.explanation}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
