# Softogram

Official marketing website for **Softogram**, a software development company.
Tagline: **"Your idea. Our code. Delivered."**

The site is a premium dark-themed marketing site with a products page, client work, a blog, a contact form (AWS SES), and legal policy pages.
Blog posts and projects are real CMS content served from Postgres and authored through `/admin`; they are no longer hardcoded placeholders.

## Repository layout

```
softogram/
├── frontend/          # React 19 SPA (Create React App + CRACO)
├── backend/           # FastAPI API (contact form, CMS, admin auth, AWS SES email)
├── e2e/               # Playwright end-to-end suite (primary test suite)
├── workers/blog-og/   # Lambda@Edge crawler function on CloudFront viewer-request
├── memory/            # Product + technical memory (read PRD.md and PROJECT.md)
├── design_guidelines.json
├── backend_test.py    # Legacy API integration tests
├── graphify-out/      # Knowledge graph (see graphify section below)
└── .cursor/skills/    # Design/brand agent skills (not app runtime code)
```

Do not treat `.claude/skills/`, `.cursor/skills/`, or `.agents/skills/` as application source.
They are agent tooling copied into the repo.

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, JavaScript (not TypeScript), Tailwind CSS 3, shadcn/ui (Radix), Framer Motion, React Router 7 |
| Build | Create React App via `@craco/craco`, `@/` alias → `frontend/src` |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0 (async) + Alembic on Postgres, AWS SES via `boto3` (`sesv2`) |
| Testing | Playwright e2e in `e2e/` (primary), `backend_test.py` (legacy), `data-testid` on interactive UI elements |
| Edge | CloudFront + S3; Lambda@Edge `viewer-request` function in `workers/blog-og/` |

## Brand and design (canonical)

Follow `docs/redesign/integration-plan-2026-08.md` + `design_guidelines.json`.
The Aug 2026 redesign (green GitHub-dark) is now the live brand across every route.
The legacy cyan glassmorphism page has been removed from the bundle entirely, so there is no transitional state left to respect.

- **Theme**: GitHub-dark / diff-PR honesty aesthetic (gutter, Confirmed/Reported badges, CLI proof)
- **Colors**: Background `#09090e`, accent green `#4ADE80`, amber `#FB923C`, card `#0d1117`
- **Fonts**: Fraunces (display), Outfit (body), JetBrains Mono (code/diff)
- **Primitives**: `frontend/src/components/redesign/` (`LogoMono`, `Logo`, `Badge`, `ClaimBlock`)
- **Do not** reintroduce cyan `#00F5FF` / violet `#7C3AED` in new work
- **UI**: shadcn/ui components live in `frontend/src/components/ui/`
- **Icons**: Lucide React only
- **Motion**: Framer Motion for section reveals; `react-countup` for stats; `react-fast-marquee` for testimonials

When adding UI, match the patterns already in `frontend/src/components/redesign/`: GitHub-dark cards on `#0d1117`, green `#4ADE80` accents and hover states, monospace for anything code or diff shaped, generous padding, and `data-testid` on every interactive element.

## Application architecture

**Frontend**: `frontend/src/App.js` is a thin (~77 line) router only.
Every page is lazy-loaded from `frontend/src/pages/`, and shared sections live in `frontend/src/components/redesign/`.
Routes: `/`, `/products`, `/client-work`, `/blog`, `/blog/:slug`, `/admin`, `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/cookie-policy`, plus a `*` 404.
`/case-studies` is a permanent redirect to `/client-work`.

**Backend** (`backend/server.py` for routes, `backend/cms.py` for CMS and auth data access):
- `GET /api/` - health message (`GET /api/status` was removed in issue #6; use this for liveness)
- `POST /api/contact` - contact form; emails via SES in a background task
- `POST /api/newsletter/subscribe` - newsletter lead magnet
- `GET /api/content/blog`, `/api/content/blog/{slug}`, `/api/content/projects` - public CMS reads
- `GET /api/content/blog/rss.xml` - RSS feed (proxied to `/rss.xml` by the Lambda@Edge function)
- `GET /api/content/blog/{slug}/share.html` - prerendered OG HTML for crawlers
- `GET|POST /api/content/blog/{slug}/comments` - public comment read and submit
- `POST /api/admin/login` plus `/api/admin/*` for blog, projects, comments, leads, upload, analytics

Contact form posts `{ name, email, phone, service, message }` plus a honeypot field (issue #5).
Budget range is appended to `message` on the client before POST.

**Email**: `SENDER_EMAIL` → `RECIPIENT_EMAIL` via AWS SES (`boto3` `sesv2`), not SendGrid.
SendGrid was removed in commit `03bd2db`; do not reintroduce it or its env vars.
`ReplyToAddresses` is set to the submitter's email.
Leads persist to the `leads` table in Postgres; MongoDB has been removed entirely (Phase 10, see `docs/growth/phase-10-platform-plan-2026-08.md`).

**Canonical contact email in code**: `support@softogram.in`

**Database**: Postgres is the only datastore - `leads`, `admin_users`, `admin_sessions`, `blog_posts`, `blog_comments`, `projects`, `newsletter_subscribers`.
Alembic migrations apply automatically on backend boot (`server.py`'s `lifespan`); there is no separate migrate step to remember.
Local Postgres runs via `docker compose up -d` (root `docker-compose.yml`).
Admin auth is live as of Phase 11: `admin_users` holds argon2 password hashes, and `admin_sessions` stores only `sha256(token)` for bearer sessions issued by `POST /api/admin/login`.
The old shared `ADMIN_PASSWORD` env var is gone.
There is deliberately one admin account and no role system yet; roles are deferred until a second admin actually exists (issue #53).

## Environment variables

**Frontend** (`frontend/.env` or build-time):
```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_POSTHOG_KEY=          # optional; analytics no-ops when unset
REACT_APP_POSTHOG_HOST=
REACT_APP_BOOKING_URL=          # Cal.com booking link
REACT_APP_CLUTCH_URL=           # optional directory profile links
REACT_APP_GOODFIRMS_URL=
REACT_APP_GBP_URL=
```

**Backend** (`backend/.env`):
```
SENDER_EMAIL=admin@softogram.in
RECIPIENT_EMAIL=support@softogram.in
AWS_SES_REGION=ap-south-1
AWS_SES_ENDPOINT_URL=           # override only for local/e2e SES mocking
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql+asyncpg://softogram:softogram@localhost:5432/softogram
ADMIN_SEED_EMAIL=               # seeds the single admin user on boot
ADMIN_SEED_PASSWORD=
SITE_URL=https://softogram.in
POSTHOG_API_KEY=                # optional; powers the admin analytics panel
POSTHOG_PROJECT_ID=
POSTHOG_HOST=
```

AWS SES credentials come from the standard AWS credential chain (instance role in production), not from a key in `.env`.
Rate limits for the contact form and admin login are tunable via `CONTACT_RATE_LIMIT_PER_MINUTE`/`_PER_HOUR` and `ADMIN_LOGIN_RATE_LIMIT_PER_MINUTE`/`_PER_HOUR`.

Never commit real API keys.
Warn if asked to commit `.env` files.

## Local development

```bash
# Postgres (once, or after a machine restart)
docker compose up -d

# Backend
cd backend && pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Frontend
cd frontend && yarn install && yarn start
```

Optional: `ENABLE_HEALTH_CHECK=true` in frontend env enables CRACO webpack health plugin.

## Code conventions

- **Frontend**: Functional React components, hooks, Tailwind utility classes, `cn()` from `@/lib/utils` for class merging
- **Backend**: Async FastAPI routes, Pydantic models, background tasks for email (do not block the HTTP response on SES)
- **Scope**: Minimal diffs; add new pages under `frontend/src/pages/` and shared sections under `frontend/src/components/redesign/` rather than growing `App.js`, which is a router only
- **Dependencies**: Match existing stack; do not introduce TypeScript or Next.js without explicit approval
- **Emergent**: `@emergentbase/visual-edits` wraps CRACO in dev mode only; do not break that integration

## Testing

- **E2E suite (primary)**: `cd e2e && npm test` - Playwright drives the real frontend + backend with AWS SES mocked locally via `e2e/fixtures/ses-mock.js`; see `e2e/README.md` and `docs/testing/e2e-framework.md`
- Legacy API tests: `python backend_test.py` (defaults to preview URL; override base URL as needed)
- New interactive UI must include `data-testid` attributes (project standard from `design_guidelines.json`)
- Bug fixes must add or flip a test that fails before the fix
- Fix lint/test failures you encounter, even if unrelated to the current task
- CI gates on PRs: `e2e.yml` (Playwright), `lighthouse.yml`, `pip-audit.yml`, and CodeQL

## Issue backlog and audits

- GitHub issues on `Softogram/softogram` are the canonical backlog; labels: `P0/P1/P2`, `security`, `email`, `growth`, `seo`, `performance`, `testing`, `ops`, `agent-ready`
- Working an issue: follow `.claude/skills/issue-workflow/SKILL.md`
- Audit and plan docs behind the issues: `docs/audit/security-audit-2026-07.md`, `docs/audit/email-integration-2026-07.md`, `docs/growth/growth-plan-2026-07.md`

## Git workflow

- `development` is the default branch and where all ongoing work lands - branch from it, open PRs into it.
- `main` is production. It is branch-protected: no direct pushes, required status checks (`playwright`, `pip-audit`, `lighthouse`, CodeQL) must pass, and only a repo admin can merge into it. Pushing to `main` (via merge from `development`) is what ships to production - the CI/CD pipelines (`.github/workflows/deploy-frontend.yml`, `deploy-backend.yml`) trigger on push to `main` only.
- Releasing is a deliberate act: open a PR from `development` into `main`; an admin merges it once checks are green.
- Agents should branch from and target `development` for issue work, not `main`, unless explicitly asked to cut a release.

## graphify (codebase knowledge graph)

`graphify-out/` contains an indexed knowledge graph of this repo.

- For focused questions: `graphify query "<question>"` (preferred over grepping)
- For relationships: `graphify path "<A>" "<B>"`
- For a concept: `graphify explain "<concept>"`
- After code changes: `graphify update .` (incremental, AST-only for code-only diffs)
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review

## Product backlog (summary)

GitHub issues on `Softogram/softogram` are the live, canonical backlog.
`memory/PRD.md` holds the original product framing but its priority lists have drifted; trust the issues over the PRD where they disagree.

Shipped since that PRD was written: AWS SES email, the Postgres CMS with `/admin` auth, cookie consent, analytics, RSS, and the Aug 2026 redesign.
Currently open themes: mobile layout bugs (#81, #82, #83), SEO (#78, #79, #80), growth and OSS distribution (#75, #84-#88), and ops (#49, #51, #52).

## Agent priorities

1. Preserve the GitHub-dark brand aesthetic on every UI change
2. Keep contact form → SES flow working end-to-end
3. Follow the `pages/` + `components/redesign/` split rather than inventing new abstractions
4. Never ship claims the product cannot back up - see the honesty rule below
5. Use `memory/PROJECT.md` for file-level map and known tech debt
6. Query graphify before large exploratory reads of the codebase

## Content honesty (hard rule)

Several past commits existed purely to strip fabricated content: invented testimonials, made-up case studies, fake portfolio stats, and fictional product reviews (`10ef6ad`, `a4353f9`).
The site's entire positioning is verifiable honesty, so this is a correctness constraint, not a style preference.

- Never invent client names, testimonials, metrics, review counts, or shipped-project claims
- Label anything not yet real as `[DEMO]`, `[STUB]`, or "preview", and make sure section headlines match what actually works
- Prefer a smaller true claim over a larger unverifiable one

## Redesign (August 2026) - complete

The port from `Redesign-Softogram-Website/` into `frontend/` is done and live on every route, `/admin` included.
Treat `Redesign-Softogram-Website/` as a historical reference, not an active source to port from.

- Brand: green `#4ADE80` + amber on GitHub-dark (supersedes the royal-blue #20 plan)
- Plan and checklist, kept for context: `docs/redesign/integration-plan-2026-08.md`, `docs/redesign/phase-checklist.md`
