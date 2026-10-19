# 05 - Web (admin + registration)

```
web/src/
  main.jsx, App.jsx          routes
  lib/api.js, auth.jsx       fetch helper, login state
  components/                ui.jsx (Button, Field, Card), Navbar,
                             QuestionsTab, StudentsTab, LeaderboardTab
  pages/                     AuthPage, Dashboard, ContestPage, RegisterPage
```

| Route | Page |
| --- | --- |
| `/signup`, `/login` | Admin account (name, club name, email, password) |
| `/` | Dashboard: list contests, create a contest |
| `/contests/:id` | Share link, Questions / Students (live) / Leaderboard tabs |
| `/c/:slug` | **Public** student registration page |

Another teacher? Just sign up with another email - each admin only sees their own contests.
