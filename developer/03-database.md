# 03 - Database (Neon Postgres)

Schema file: `backend/src/db/schema.sql`. Create tables with `npm run migrate` in `backend/`.

```
admins 1 --- * contests 1 --- * questions
                  |
                  1
                  |
                  * registrations 1 --- 1 attempts
```

| Table | Important columns |
| --- | --- |
| `admins` | name, club_name, email (unique), password_hash |
| `contests` | admin_id, title, description, slug (share link), duration_minutes |
| `questions` | contest_id, position, text, options (JSON of 4), correct_index, explanation |
| `registrations` | contest_id, name, mobile, email, college, note, **access_code** (emailed password) |
| `attempts` | registration_id, started_at, submitted_at, score, total, answers (JSON), violations |

- A student can register once per contest (`UNIQUE(contest_id, email)`).
- `access_code` is globally unique, so email + code finds exactly one registration.
- One attempt per registration: you cannot write the exam twice.
