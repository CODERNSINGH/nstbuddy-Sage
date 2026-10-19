# 01 - Overview

**NstBuddy Sage** is a quiz / exam platform with three parts. Theme: blue `rgb(0, 87, 193)`, black and green. Styling is Tailwind CSS everywhere.

| Folder | What it is | Who uses it |
| --- | --- | --- |
| `backend/` | Express API + Neon Postgres | Both apps |
| `web/` | React website: admin panel + student registration page | Teachers, students |
| `app/` | Electron exam app (proctored, full screen) | Students on MacBook |

## The story
1. Teacher creates an account (club name) on the **web**.
2. Teacher creates a contest, adds questions (form or JSON), copies the **share link**.
3. Student opens the link `/c/<slug>`, fills name, mobile, email, college (+ optional note).
4. Student gets an **email** with a unique password. Teacher sees the signup appear live.
5. Student opens the **Electron app**, logs in with email + password.
6. App asks: share screen -> share camera -> full screen. Then the quiz starts.
7. Quiz: Previous / Next, question map, remaining time. At the end the score is shown.
8. Teacher sees the **leaderboard** (score, time, warnings).
