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

## Mac app downloads
- Build installers: `cd app && npm run dist` -> `app/release/NstBuddy-Sage-arm64.dmg` (Apple Silicon) and `NstBuddy-Sage-x64.dmg` (Intel).
- Upload both to a **GitHub Release** of this repo. Keep these exact file names; the default download URLs are
  `https://github.com/CODERNSINGH/nstbuddy-Sage/releases/latest/download/<file>`.
  To host elsewhere set `DOWNLOAD_URL_ARM64` / `DOWNLOAD_URL_INTEL` on the backend.
- Two ways students get the app, both shown with Apple Silicon / Intel buttons:
  1. The contest registration link `/c/<contest>` (download section at the bottom).
  2. Each admin's **download-only link** `/d/<code>`, shown on the dashboard ("App download link"). Share it anytime.
