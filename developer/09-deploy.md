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
- Build: `cd app && npm run dist` -> `app/release/NstBuddy-Sage-arm64.dmg`.
- Upload it to Cloudflare R2 and enable **public access** (r2.dev URL or custom domain).
  The `<account>.r2.cloudflarestorage.com` address is the private S3 API and cannot be used for downloads.
- Set the public file URL as `DOWNLOAD_URL` on the backend (Render env). Default fallback: GitHub Release `NstBuddy-Sage-arm64.dmg`.
- Where students get it:
  1. On the contest link `/c/<contest>` **after they register** (or if they were already registered).
  2. Each admin's **download-only link** `/d/<code>` (dashboard, "App download link"). Share it anytime.
- If the dashboard has no download card or the link shows `undefined`, the backend is running old code: redeploy it.
