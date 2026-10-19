# 04 - Backend

```
backend/src/
  index.js            starts Express, mounts routes
  config.js           reads .env
  db/                 pool.js, schema.sql, migrate.js
  middleware/auth.js  JWT sign + requireAdmin / requireStudent
  utils/              helpers.js (codes, slugs, validation), mailer.js
  routes/             auth.js, contests.js, questions.js, public.js, exam.js
```

## API
**Admin auth** `/api/auth`: `POST /signup`, `POST /login`, `GET /me`

**Admin (needs admin token)** `/api/contests`
- `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `POST /:id/questions` - one question or `{ "questions": [...] }` (JSON import)
- `PUT|DELETE /:id/questions/:qid`
- `GET /:id/registrations`, `POST /:id/registrations/:regId/resend`
- `GET /:id/leaderboard` (score desc, then faster time)

**Live monitoring** `ws://host/ws?token=...` (see 02-architecture.md). File: `src/live.js`.

**Public** `/api/public/contests/:slug` (`GET`) and `/register` (`POST`)

**Exam (student token)** `/api/exam`: `POST /login`, `POST /start`, `PUT /progress`, `POST /violation`, `POST /submit`

## Question JSON pattern
```json
[
  {
    "text": "What is 2 + 2?",
    "options": ["1", "2", "3", "4"],
    "correctIndex": 3,
    "explanation": "Two plus two is four."
  }
]
```

## Env (`backend/.env`, never committed)
`DATABASE_URL`, `JWT_SECRET`, `WEB_URL`, optional `SMTP_*`, `MAIL_FROM`. See `.env.example`.
