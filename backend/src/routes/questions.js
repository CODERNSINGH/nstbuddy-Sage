import { Router } from 'express'
import { query } from '../db/pool.js'
import { validateQuestion } from '../utils/helpers.js'

// Mounted at /api/contests/:id/questions  (req.contest is set by the parent router)
const router = Router()

/*
  Accepts ONE question or a LIST (that is the "add JSON" feature):
  { "text": "2+2?", "options": ["1","2","3","4"], "correctIndex": 3, "explanation": "..." }
  or  { "questions": [ {...}, {...} ] }
*/
router.post('/', async (req, res) => {
  const list = req.body.questions || [req.body]
  if (!Array.isArray(list) || !list.length) return res.status(400).json({ error: 'No questions sent' })

  for (const [i, q] of list.entries()) {
    const problem = validateQuestion(q)
    if (problem) return res.status(400).json({ error: `Question ${i + 1}: ${problem}` })
  }

  const [{ max }] = await query('SELECT COALESCE(max(position), 0) AS max FROM questions WHERE contest_id = $1', [
    req.contest.id,
  ])
  let position = Number(max)
  for (const q of list) {
    position += 1
    await query(
      'INSERT INTO questions (contest_id, position, text, options, correct_index, explanation) VALUES ($1,$2,$3,$4,$5,$6)',
      [req.contest.id, position, q.text.trim(), JSON.stringify(q.options), q.correctIndex, q.explanation || ''],
    )
  }
  res.status(201).json({ added: list.length })
})

router.put('/:questionId', async (req, res) => {
  const problem = validateQuestion(req.body)
  if (problem) return res.status(400).json({ error: problem })
  const { text, options, correctIndex, explanation = '' } = req.body
  await query(
    'UPDATE questions SET text=$1, options=$2, correct_index=$3, explanation=$4 WHERE id=$5 AND contest_id=$6',
    [text.trim(), JSON.stringify(options), correctIndex, explanation, req.params.questionId, req.contest.id],
  )
  res.json({ ok: true })
})

router.delete('/:questionId', async (req, res) => {
  await query('DELETE FROM questions WHERE id = $1 AND contest_id = $2', [req.params.questionId, req.contest.id])
  res.json({ ok: true })
})

export default router
