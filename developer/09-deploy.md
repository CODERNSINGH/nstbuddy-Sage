# 09 - Deploy (Render) + app downloads

`render.yaml` at the repo root creates both services. Or by hand:

**Backend** (Web Service, Root Directory `backend`)
- Build: `npm install && npm run migrate`  (migrate only creates missing tables, safe every deploy)
- Start: `npm start`, Health check: `/api/health`
- Env: `DATABASE_URL`, `JWT_SECRET`, `WEB_URL`, `SMTP_*`, `MAIL_FROM` (see 07-setup.md)

**Website** (Static Site, Root Directory `web`)
- Build: `npm install && npm run build`, Publish directory: `dist`
- Rewrite rule: `/*` -> `/index.html`  (needed for `/c/...` and `/d/...` links)
- **No env needed.** The site and the app default to `https://nstbuddy-sage.onrender.com`.
  For local development put `VITE_API_URL=http://localhost:4000` in `.env` (git ignored).
  Production builds always use `.env.production`.

## Mac app download (Apple Silicon only)
- Build: `cd app && npm run dist` -> `app/release/NstBuddy-Sage-arm64.dmg` (~95 MB).
- The app is **ad-hoc signed** (`mac.identity: '-'`). Without a valid signature, Apple Silicon Macs say the app is "damaged".
  `electron/after-pack.cjs` removes the unused SwiftShader library (16 MB) before signing to keep the file small.
- The installer is attached to a **GitHub Release** (not committed to git, which has a 100 MB file limit):
  `gh release create v1.0.0 app/release/NstBuddy-Sage-arm64.dmg --title "NstBuddy Sage 1.0.0"`.
  A new version = a new release with the same file name; the backend always fetches `releases/latest`.
- **How the download button works:** it links to `<backend>/api/download/app`. The backend streams the file from GitHub,
  so the browser starts the download immediately from our own address (no redirect, no GitHub page).
  Source can be changed with `DOWNLOAD_SOURCE_URL`. Note: each download uses ~95 MB of Render outbound bandwidth.
- Where students get it:
  1. On the contest link `/c/<contest>` **after they register** (or if they were already registered).
  2. Each admin's **download-only link** `/d/<code>` (dashboard, "App download link"). Share it anytime.
- If the dashboard has no download card or the link shows `undefined`, the backend is running old code: redeploy it.
- macOS says "damaged"? Students run once: `xattr -cr "/Applications/NstBuddy Sage.app"` (shown on the download page).

## Email on Render
Render **free** instances block outbound SMTP ports (25, 465, 587), so Gmail SMTP works on your laptop but times out on Render.
Pick one:
1. **Resend (easiest, HTTPS):** create an API key at resend.com, verify your domain, set `RESEND_API_KEY` and `MAIL_FROM="NstBuddy Sage <no-reply@yourdomain>"` on Render.
2. **SMTP on port 2525** (e.g. Brevo): `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=2525`, `SMTP_USER`, `SMTP_PASS`.
3. A paid Render instance (SMTP ports open) with the Gmail settings.

**Check your setup:** log in to the website, the dashboard has an **Email setup** card. Press *Send test email to me*.
If it fails you see the exact error plus advice (wrong App Password, blocked port, unverified Resend domain...).
The backend log also prints `Mail: ...` at startup.

**What happens when a student registers:** the first try is immediate. If it fails the student is told, the backend retries after
1 and 5 minutes, and the Students tab shows *mail sent / mail failed* (hover for the reason) with a Resend button.
Mails interrupted by a server restart are retried on the next start.

Tips: Google App Passwords are shown with spaces, spaces are ignored. With Gmail, `MAIL_FROM` should use the same Gmail address as `SMTP_USER`.

## Keep Render awake
- The backend pings its own public address every 14 minutes (`src/keepAlive.js`, uses Render's `RENDER_EXTERNAL_URL`).
- The website also pings `/api/health` when it opens, so a sleeping backend starts waking before the first click.
- A service that is already asleep cannot ping itself. For extra safety add a free outside pinger (UptimeRobot, cron-job.org) calling `https://nstbuddy-sage.onrender.com/api/health` every 5-10 minutes.
- A single free web service can run 24/7 within Render's 750 free hours per month.

## Security notes
- Rate limits: admin login/signup, exam login (per IP + email, so a class on one Wi-Fi is fine) and student registration (stops mass-mailing).
- The exam deadline is enforced on the server: autosave is refused after time is up, and a late submit only counts answers saved before the deadline.
- Student names are HTML-escaped in emails.
