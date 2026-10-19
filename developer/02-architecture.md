# 02 - Architecture

```
 Teacher (browser)              Student (browser)          Student (MacBook)
      |                               |                          |
   web/ admin panel            web/ /c/:slug page          app/ Electron exam
      |                               |                          |
      +------------- HTTPS JSON -------+--------------------------+
                                      |
                               backend/ (Express)
                                      |
                              Neon Postgres (pg)
```

## Rules we follow
- **One backend, thin clients.** All logic that matters (score, timer, passwords) lives in the backend.
- **Correct answers never leave the server** until the student submits.
- **The timer is the server's clock.** The app counts down to `endsAt` from the server, so changing the Mac clock does nothing.
- **Two token roles** (JWT): `admin` (web) and `student` (Electron). Each route checks its role.
- **Live signups** use simple polling (every 5s). Simple beats clever here.
- Emails use SMTP when configured; otherwise they are printed in the backend terminal.
