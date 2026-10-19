import { useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card, ErrorText, Field } from './ui.jsx'

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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <h3 className="mb-3 font-bold">Add a question</h3>
          <form onSubmit={addOne} className="space-y-3">
            <Field label="Question" as="textarea" rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
            {form.options.map((option, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label={`Option ${'ABCD'[i]}`} value={option} onChange={(e) => setOption(i, e.target.value)} required />
                </div>
                <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-accent">
                  <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} />
                  Correct
                </label>
              </div>
            ))}
            <Field label="Explanation" as="textarea" rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            <Button variant="green">Add question</Button>
          </form>
        </Card>

        <Card>
          <h3 className="mb-1 font-bold">Or paste JSON</h3>
          <p className="mb-2 text-xs text-slate-500">Use this pattern (list of questions):</p>
          <pre className="mb-3 overflow-x-auto rounded-lg bg-ink p-3 text-xs text-green-400">{SAMPLE_JSON}</pre>
          <textarea
            className="h-32 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs outline-none focus:border-brand"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste JSON here"
          />
          <Button className="mt-2" onClick={addJson} disabled={!json.trim()}>
            Import JSON
          </Button>
        </Card>
        <ErrorText>{error}</ErrorText>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold">{questions.length} questions</h3>
        {questions.map((q, i) => (
          <Card key={q.id} className="p-4">
            <div className="flex justify-between gap-3">
              <p className="font-semibold">
                {i + 1}. {q.text}
              </p>
              <button className="text-xs text-red-600" onClick={() => remove(q.id)}>
                Delete
              </button>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {q.options.map((o, j) => (
                <li key={j} className={j === q.correctIndex ? 'font-semibold text-accent' : 'text-slate-600'}>
                  {'ABCD'[j]}. {o} {j === q.correctIndex && '✓'}
                </li>
              ))}
            </ul>
            {q.explanation && <p className="mt-2 rounded bg-brand-light p-2 text-xs text-brand-dark">{q.explanation}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
