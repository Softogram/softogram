# Softogram — Project Memory

Living technical memory for agents and developers.
Pair with `memory/PRD.md` for product framing and history.

Last reviewed: August 2026

## What this repo is

Marketing website, contact API, and a small content CMS for Softogram - a custom software development shop with an India-focused SMB and startup audience.
Not a monorepo product app; the "application" is the marketing site, its lead-capture funnel, and the admin dashboard that feeds it content.

## Current state snapshot

| Area | Status |
|------|--------|
| Marketing routes (`/`, `/products`, `/client-work`) | Shipped, green GitHub-dark brand |
| Blog (`/blog`, `/blog/:slug`) | **CMS-backed from Postgres**, with comments, moderation and RSS |
| Admin dashboard (`/admin`) | Shipped: blog, projects, leads, comments, analytics |
| Admin auth | **Live** - argon2 password hashes, sha256 bearer sessions (Phase 11) |
| Legal pages (privacy, terms, refund, cookie) | Shipped |
| Contact → email | **AWS SES** via `boto3` (`sesv2`). SendGrid removed in `03bd2db` |
| Primary database | Postgres (SQLAlchemy async + Alembic). MongoDB removed entirely in Phase 10 |
| Frontend structure | `App.js` is a router only; pages in `pages/`, sections in `components/redesign/` |
| TypeScript migration | Not started, and not planned; frontend is `.js`/`.jsx` |
| Roles / multi-admin | Deliberately deferred until a second admin exists (issue #53) |

## File map (what lives where)

### Frontend (`frontend/`)

| Path | Role |
|------|------|
| `src/App.js` | Router only (~80 lines): lazy route definitions, providers, skip link, consent banner |
| `src/pages/*.jsx` | One file per route: `Home`, `Products`, `ClientWork`, `Blog`, `BlogPost`, `Admin`, `NotFound`, `policies` |
| `src/components/redesign/*` | Shared sections and primitives: `Layout` (nav + footer + `<main>`), `Terminal`, `BuildLog`, `ShippedSection`, `SeoHead`, `Badge`, `ClaimBlock`, `homePrimitives` |
| `src/components/ui/*` | shadcn/ui primitives (vendored) |
| `src/hooks/useScrollReveal.js` | Scroll-reveal visibility, reduced-motion aware |
| `src/lib/` | `cmsApi` (CMS fetches), `analytics` (PostHog), `seo` (structured data), `utils` (`cn()`) |
| `src/data/site.js` | Contact details, booking URL, trust badge links |
| `lighthouserc.js` | Per-route performance and accessibility budgets |
| `craco.config.js` | Webpack alias `@`, visual-edits hook, optional health check |

### Backend (`backend/`)

| Path | Role |
|------|------|
| `server.py` | FastAPI app: contact, newsletter, public CMS reads, RSS, crawler HTML, admin routes, SES helper, migration-on-boot |
| `cms.py` | CMS and auth data access: posts, projects, comments, admin users, sessions |
| `database.py` / `models.py` | Async SQLAlchemy engine + ORM models (7 tables) |
| `migrations/` | Alembic migrations, applied automatically on boot |
| `requirements.txt` | Python deps (boto3, SQLAlchemy, asyncpg, Alembic, FastAPI) |

### Root

| Path | Role |
|------|------|
| `e2e/` | **Primary test suite** - Playwright, with a local SES mock |
| `workers/blog-og/` | Lambda@Edge `viewer-request` function: crawler OG HTML and `/rss.xml` |
| `backend_test.py` | Legacy API smoke tests |
| `design_guidelines.json` | Brand tokens and layout rules |
| `graphify-out/` | Generated knowledge graph; safe to regenerate |

## Data flows

### Contact form

```
User fills form
  → axios POST REACT_APP_BACKEND_URL/api/contact
  → FastAPI validates ContactFormRequest (+ honeypot, rate limit)
  → lead persisted to Postgres
  → background_tasks.add_task(send_contact_email, ...)
  → SES sesv2 send_email(from=SENDER_EMAIL, to=RECIPIENT_EMAIL, ReplyToAddresses=[user])
  → 200 { status: "success", message: "..." }
```

Budget range is **not** a separate API field; the frontend appends it to `message`.
Email dispatch is a background task on purpose - never block the HTTP response on SES.

### API contract (`POST /api/contact`)

```json
{
  "name": "string",
  "email": "valid@email.com",
  "phone": "string",
  "service": "string",
  "message": "string"
}
```

### Blog rendering

Browsers get the SPA and fetch from `/api/content/blog`.
Link-preview crawlers never run JavaScript, so the Lambda@Edge function intercepts `/blog/:slug` for known crawler user agents and returns prerendered HTML from `/api/content/blog/{slug}/share.html` instead.

## Design source of truth

`docs/redesign/integration-plan-2026-08.md` and `design_guidelines.json`, with `frontend/src/components/redesign/` as the live reference implementation.

Canonical palette:
- Background `#09090e`, card `#0d1117`
- Accent green `#4ADE80`, amber `#FB923C`
- Fraunces (display), Outfit (body), JetBrains Mono (code and diff)

The cyan `#00F5FF` / violet `#7C3AED` glassmorphism brand is **gone** and must not be reintroduced.

## Known tech debt

1. **Meta tags are JS-only** - `SeoHead` mutates `document.head` in an effect, so raw HTML is identical across routes for non-JS crawlers (issue #80)
2. **Colour contrast** - several brand text colours sit at `rgba(255,255,255,0.15-0.35)` and fail contrast checks; raising them is a design decision
3. **Homepage GitHub stats** are fetched from the visitor's browser and get rate-limited (issue #99)
4. **Build log and shipped list** are hardcoded arrays, not synced from real releases (issue #66)
5. **Dependabot** reports a large number of alerts on the default branch, untriaged
6. **Large agent skill trees** in `.cursor/skills` and `.claude/skills` - agent tooling, not deploy artefacts

## Deployment notes

- `development` is the working branch; `main` is production and branch-protected
- Pushing to `main` triggers `deploy-frontend.yml` (S3 + CloudFront) and `deploy-backend.yml` (EC2 over SSH)
- `deploy-backend.yml` is path-filtered, so frontend-only releases do not redeploy the API
- Lambda@Edge is deployed manually and needs a published version ARN - see `workers/blog-og/README.md`

## Commands cheat sheet

```bash
# Postgres (required for the backend and the e2e suite)
docker compose up -d

# Frontend dev
cd frontend && yarn start

# Backend dev
cd backend && uvicorn server:app --reload --port 8000

# End-to-end suite (primary gate)
cd e2e && npm test

# Legacy API tests
python backend_test.py

# Refresh knowledge graph after edits
graphify update .
```

## What not to do

- Do not grow `App.js`; add pages under `pages/` and shared sections under `components/redesign/`
- Do not migrate to TypeScript or Next.js without an explicit request
- Do not reintroduce MongoDB or SendGrid; Postgres and SES are the current stores and sender
- Do not reintroduce cyan or violet, and do not change brand colours or fonts casually
- Do not invent testimonials, client names, metrics or shipped claims - see the content-honesty rule in `CLAUDE.md`
- Do not commit secrets or modify auto-generated changelogs
- Do not treat `graphify-out/` as hand-edited source

## Related docs

- `memory/PRD.md` — product framing, personas, history
- `CLAUDE.md` — agent briefing (stack, conventions, graphify)
- `docs/redesign/integration-plan-2026-08.md` — brand and redesign plan
- `docs/testing/e2e-framework.md` — how the Playwright suite is wired
- `graphify-out/GRAPH_REPORT.md` — codebase graph audit
