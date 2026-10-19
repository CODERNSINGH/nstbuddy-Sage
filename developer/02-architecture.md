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

## Live monitoring (screen + camera)
```
 Student app  --(WebRTC video, peer to peer)-->  Admin browser
      \                                              /
       +---- WebSocket /ws (small connect messages) +---- backend/src/live.js
```
- Video goes **directly** student -> admin. The backend only relays "signaling" messages. **Nothing is recorded or stored.**
- Admin opens the **Monitor** tab, sees who is online, clicks **Watch live**. The student app then starts sending its screen + camera to that admin only.
- Backend checks the admin owns the contest before letting them watch its students. Dead connections are dropped by a 15s heartbeat, and a student's reconnect replaces the old connection.
- Uses a public STUN server. On very strict networks (some college Wi-Fi) a TURN server may be needed.

## Shuffled options
The server shuffles each student's options (seeded by student + question, so it stays the same after an app restart). Answers are saved with the **original** option index, so scoring and the admin portal still use the original order.
