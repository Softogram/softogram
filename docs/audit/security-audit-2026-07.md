# Softogram Security Audit - July 2026

Audit of the Softogram marketing site (React SPA + FastAPI backend) performed on 2026-07-11.
Scope: backend API, frontend, dependency posture, secrets hygiene, and the live production deployment at `softogram.in` / `api.softogram.in`.
Each finding below has a corresponding GitHub issue.

## Severity legend

- **P0**: actively broken or exploitable in production right now.
- **P1**: real risk or defect, fix in the next work cycle.
- **P2**: hygiene and hardening.

---

## P0 findings

### SEC-1: Expired TLS certificate on api.softogram.in (contact form dead in production)

- The Let's Encrypt certificate for `api.softogram.in` expired on **2026-06-09** (`notAfter=Jun 9 11:55:33 2026 GMT`, issuer E7).
- Every browser blocks the `POST https://api.softogram.in/api/contact` call, so the contact form has silently failed for every visitor since that date.
- The main site cert (`www.softogram.in`, Amazon-issued) is fine, which hides the breakage: the site looks healthy.
- Root cause: no auto-renewal for the API cert and no uptime/TLS monitoring to catch it.

**Fix**: renew the cert, enable auto-renewal (certbot timer, or front the API with Caddy/CDN that manages certs), and add external uptime + certificate-expiry monitoring.

### SEC-2: CORS reflects arbitrary origins with credentials enabled (verified live)

- `backend/server.py:168-174` configures `CORSMiddleware` with `allow_origins=os.environ.get('CORS_ORIGINS', '*').split(',')` and `allow_credentials=True`.
- Production runs with the wildcard: a preflight from `Origin: https://evil.example.com` returns `access-control-allow-origin: https://evil.example.com` with `access-control-allow-credentials: true` (verified against the live API on 2026-07-11).
- Any website can script requests against the API.
Today the API is small, but this combination is the worst-practice baseline and becomes dangerous the moment any stateful or authenticated endpoint is added.

**Fix**: set `CORS_ORIGINS=https://softogram.in,https://www.softogram.in` in production, fail closed (no `*` default) when credentials are allowed, and restrict `allow_methods` to `GET,POST` and headers to `Content-Type`.

---

## P1 findings

### SEC-3: HTML and header injection in the contact notification email

- `backend/server.py:63-110` interpolates `name`, `phone`, `service`, and `message` directly into the HTML email body, and `name` into the subject line.
- A submitter can inject arbitrary HTML (links, images, fake content) into an email that arrives in the Softogram inbox from a trusted internal sender, which is a convincing phishing vector.
- `reply_to` is attacker-controlled by design, which is fine alone but amplifies the phishing risk when combined with injected content.

**Fix**: run every user-supplied value through `html.escape()` before interpolation, and strip newlines from values used in the subject.

### SEC-4: No rate limiting or spam protection on POST /api/contact

- The endpoint accepts unlimited anonymous submissions.
- Consequences: SendGrid quota burn, inbox flooding, and use of the form as a spam relay (the success response and email dispatch are unconditional).
- There is no CAPTCHA, honeypot field, or per-IP throttle.

**Fix**: add `slowapi` per-IP rate limiting (e.g. 5/hour per IP), a hidden honeypot field on the frontend, and optionally Cloudflare Turnstile.

### SEC-5: Unauthenticated /api/status endpoint reads the database and hangs

- `backend/server.py:156-162` exposes up to 1000 `status_checks` documents to anyone, with no auth.
- The Motor client has no `serverSelectionTimeoutMS`, so when Mongo is unreachable the request hangs.
The live endpoint currently times out after 10+ seconds (verified 2026-07-11), which is a cheap resource-exhaustion vector.

**Fix**: delete the endpoint (contact submissions are not persisted, so it serves nothing), or protect it and add `serverSelectionTimeoutMS=2000` to the client.

### SEC-6: Bloated backend dependencies with known-vulnerable pins

- `backend/requirements.txt` lists ~120 packages; the app imports roughly 8 (fastapi, uvicorn, pydantic, email-validator, python-dotenv, motor, sendgrid, and stdlib).
- Unused but installed: boto3, stripe, openai, litellm, google-genai, huggingface_hub, pandas, numpy, passlib, python-jose, and more.
- Known CVEs in the pinned set: Starlette 0.37.2 (CVE-2024-47874 multipart DoS, reachable since python-multipart is installed), python-jose (CVE-2024-33663, CVE-2024-33664), ecdsa (CVE-2024-23342).
- FastAPI 0.110.1 is far behind current.

**Fix**: rewrite `requirements.txt` to the actual runtime dependency set, upgrade FastAPI/Starlette to current, and add `pip-audit` to CI.

### SEC-7: No input constraints on ContactFormRequest

- `backend/server.py:40-45` uses unbounded `str` fields.
- A single submission can carry megabytes of text into the email pipeline, and garbage phone values pass through.

**Fix**: add `Field(max_length=...)` constraints (name 100, phone 20, service 100, message 5000) and a basic phone pattern.

---

## P2 findings

### SEC-8: Secrets hygiene

- `.env` files were tracked in git history (commits `6b6f2ba`, `7636e14`, removed in `b8ca295`).
Verified: the historical values were placeholders only, so no live secret leaked.
- The root `.gitignore` is corrupted: it contains literal `-e` lines and three duplicated "Environment files" blocks from repeated `echo -e` appends.
- There is no `.env.example` for either backend or frontend.
- A live SendGrid API key sits in the local `backend/.env`.
It never entered git, but rotating it after this audit is cheap insurance, and it must never be pasted into issues, commits, or logs.
- `.gitconfig` is tracked in the repo and sets the committer identity to an Emergent bot.

**Fix**: clean `.gitignore`, add `backend/.env.example` and `frontend/.env.example` with placeholder values, remove `.gitconfig` from tracking, rotate the SendGrid key.

### SEC-9: Missing security headers

- The site and API send no `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy`.

**Fix**: add headers at the hosting/CDN layer for the frontend, and a small middleware for FastAPI responses.

---

## What was checked and found OK

- Git history contains no real secrets (searched all revisions for SendGrid key patterns and env files).
- The SendGrid API key is valid and the sender `admin@softogram.in` is verified (read-only API check, no email sent).
- No dangerous `dangerouslySetInnerHTML` usage in the frontend contact path.
- The frontend PostHog key is public by design (client-side analytics keys are not secrets).
