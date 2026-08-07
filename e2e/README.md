# Softogram end-to-end tests

Playwright drives a real Chromium browser against the real CRA frontend and the real FastAPI backend.
SendGrid is replaced by a local mock (`fixtures/sendgrid-mock.js`), so tests assert the exact email payload that would be sent, without sending real email or spending quota.

```
Playwright (chromium)
   -> React dev server        http://localhost:3100
   -> FastAPI backend         http://localhost:8001   (SENDGRID_HOST points at the mock)
   -> SendGrid mock           http://localhost:8025   (captures /v3/mail/send)
```

All three servers are started automatically by `playwright.config.js` (`webServer`); you never start them by hand.

## One-time setup

```bash
# 1. Local Postgres (creates both the dev and softogram_e2e databases)
docker compose up -d

# 2. Backend python env (kept in backend/.venv; auto-detected by the config)
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt

# 3. Frontend deps (if not already installed)
cd frontend && yarn install && cd ..

# 4. E2E deps + browser
cd e2e && npm install && npx playwright install chromium
```

## Running

```bash
cd e2e
npm test            # headless run
npm run test:headed # watch the browser
npm run test:ui     # Playwright UI mode
npm run report      # open the last HTML report
```

The backend applies pending Alembic migrations automatically on boot, against the
`softogram_e2e` database (see `playwright.config.js`), and the suite asserts legacy
`/api/status` is gone (issue #6). MongoDB has been removed entirely (issue #34);
Postgres is the only datastore.

## Suite layout

| File | Covers |
|---|---|
| `tests/api.spec.js` | Backend contract: health, valid/invalid submissions, email payload, SendGrid-failure path |
| `tests/contact-form.spec.js` | Full browser flow: fill form, Radix selects, toast, form reset, email payload including budget |
| `tests/home.spec.js` | Landing sections, CTAs, WhatsApp button |
| `tests/navigation.spec.js` | Every public route renders |
| `tests/seo.spec.js` | Title, meta description, OG tags, JSON-LD |

## `test.fixme` entries are intentional

Several tests are marked `test.fixme` and reference a GitHub issue (#2 CORS, #4 email escaping, #12 WhatsApp country code, #13 SEO meta, #19 blank 404).
They encode the **desired** behavior for open bugs.
When you fix the issue, flip `test.fixme` to `test` and the suite enforces it forever.

## Conventions for new tests

- Select elements by `data-testid` (project standard; add testids to any new interactive UI).
- Reset the mock in `beforeEach` with `resetEmails(request)` from `fixtures/helpers.js`.
- Assert email dispatch through the mock (`waitForEmails`), never by sleeping blindly.
- Force SendGrid failures with `forceSendFailure(request, 500, n)` for failure-path coverage.
