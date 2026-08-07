# Secrets hygiene ops (issue #9)

## Done in code
- Clean single-block `.gitignore` (env files ignored; `!.env.example` kept)
- `backend/.env.example` + `frontend/.env.example` document runtime vars
- `.gitconfig` removed from git tracking and ignored

## Your ops checklist — rotate SendGrid
1. SendGrid → Settings → API Keys → create a new Restricted key (Mail Send).
2. Update production server `SENDGRID_API_KEY` (and local `backend/.env`).
3. Delete/disable the old key.
4. Smoke-test: submit the contact form (or hit `/api/contact` in staging) and confirm email delivery.
5. Never paste the key into git, Issues, Slack, or chat logs.
