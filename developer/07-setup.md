# 07 - Setup

```bash
# 1. Backend
cd backend && cp .env.example .env     # fill DATABASE_URL and JWT_SECRET
npm install && npm run migrate && npm run dev     # http://localhost:4000

# 2. Web
cd web && cp .env.example .env && npm install && npm run dev   # http://localhost:5173

# 3. Exam app (Electron)
cd app && cp .env.example .env && npm install
node node_modules/electron/install.js   # only if Electron binary is missing
npm run dev       # dev mode
npm start         # build + run
```

Without SMTP settings, the student password email is printed in the backend terminal.

## Try it
1. Web: sign up, create a contest, add questions, copy the link.
2. Open the link, register a student, copy the password from the backend terminal.
3. Run the Electron app and login.

## Email (student password mails)
Edit `backend/.env` and fill 5 lines, then restart the backend:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=<16 letter Google App Password>
MAIL_FROM="NstBuddy Sage <yourname@gmail.com>"
```
Gmail needs 2-Step Verification on, then Google Account > Security > App passwords.
On startup the backend prints `Mail: ready via ...` or the SMTP error. Empty `SMTP_HOST` = mails are printed in the terminal only.
