-- Admin = a teacher / club account
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  club_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One contest = one quiz exam with its own share link (slug)
CREATE TABLE IF NOT EXISTS contests (
  id               SERIAL PRIMARY KEY,
  admin_id         INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  slug             TEXT NOT NULL UNIQUE,
  duration_minutes INT NOT NULL DEFAULT 30,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id            SERIAL PRIMARY KEY,
  contest_id    INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  position      INT NOT NULL,
  text          TEXT NOT NULL,
  options       JSONB NOT NULL,          -- ["A", "B", "C", "D"]
  correct_index INT NOT NULL,            -- 0..3
  explanation   TEXT NOT NULL DEFAULT ''
);

-- A student who signed up through the share link
CREATE TABLE IF NOT EXISTS registrations (
  id          SERIAL PRIMARY KEY,
  contest_id  INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  mobile      TEXT NOT NULL,
  email       TEXT NOT NULL,
  college     TEXT NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  access_code TEXT NOT NULL UNIQUE,      -- the "unique password" emailed to the student
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contest_id, email)
);

-- One attempt per registration
CREATE TABLE IF NOT EXISTS attempts (
  id              SERIAL PRIMARY KEY,
  registration_id INT NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  score           INT,
  total           INT,
  answers         JSONB NOT NULL DEFAULT '{}',   -- { "questionId": chosenIndex }
  violations      INT NOT NULL DEFAULT 0
);

-- Each admin gets one unique "download the app" link (/d/<download_slug>)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS download_slug TEXT NOT NULL
  DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 12);
CREATE UNIQUE INDEX IF NOT EXISTS admins_download_slug_key ON admins (download_slug);

-- Did the password email reach the mail server? ('pending' | 'sent' | 'failed')
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mail_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mail_error TEXT NOT NULL DEFAULT '';
