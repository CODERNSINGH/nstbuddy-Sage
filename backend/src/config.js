import 'dotenv/config'

export const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  webUrl: process.env.WEB_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Mac app installers. Default = the latest GitHub Release of this repo.
  downloads: {
    arm64: process.env.DOWNLOAD_URL_ARM64 || 'https://github.com/CODERNSINGH/nstbuddy-Sage/releases/latest/download/NstBuddy-Sage-arm64.dmg',
    intel: process.env.DOWNLOAD_URL_INTEL || 'https://github.com/CODERNSINGH/nstbuddy-Sage/releases/latest/download/NstBuddy-Sage-x64.dmg',
  },
  mailFrom: process.env.MAIL_FROM || 'NstBuddy Sage <no-reply@nstbuddy.com>',
}
