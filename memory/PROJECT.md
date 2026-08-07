# Softogram — Project Memory

Living technical memory for agents and developers.
Pair with `memory/PRD.md` for product requirements and backlog.

Last reviewed: July 2026

## What this repo is

Marketing website + contact API for Softogram (custom software dev shop, India-focused SMB/startup audience).
Not a monorepo product app; the "application" is the landing site and lead-capture funnel.

## Current state snapshot

| Area | Status |
|------|--------|
| Landing page (hero, stats, services, pricing, portfolio, testimonials, contact) | Shipped |
| Case studies page (`/case-studies`) | Static content in `App.js` (Polluxkart, Expense Splitter, API Gateway) |
| Blog page (`/blog`) | Static post cards; no individual post routes or CMS |
| Legal pages (privacy, terms, refund, cookie) | Shipped |
| Contact → SendGrid email | Implemented; requires env keys in production |
| Primary database | Postgres (SQLAlchemy async + Alembic). MongoDB removed entirely in Phase 10 - see `docs/growth/phase-10-platform-plan-2026-08.md` |
| TypeScript migration | Not started; frontend is `.js`/`.jsx` |
| Component extraction from `App.js` | Not done; single-file architecture |

## File map (what lives where)

### Frontend (`frontend/`)

| Path | Role |
|------|------|
| `src/App.js` | **Entire SPA**: all pages, sections, routing, contact form, policy pages |
| `src/App.css` | Global styles, CSS variables, animations |
| `src/index.js` | React entry |
| `src/lib/utils.js` | `cn()` helper (clsx + tailwind-merge) |
| `src/components/ui/*` | shadcn/ui primitives (Button, Card, Select, etc.) |
| `tailwind.config.js` | shadcn HSL token theme extension |
| `craco.config.js` | Webpack alias `@`, visual-edits hook, optional health check |
| `plugins/health-check/` | Dev-server health endpoints (opt-in via env) |

### Backend (`backend/`)

| Path | Role |
|------|------|
| `server.py` | FastAPI app, `/api/contact`, SendGrid helper, CORS, migration-on-boot |
| `database.py` / `models.py` | Async SQLAlchemy engine + ORM models (7 tables) |
| `migrations/` | Alembic migrations |
| `scripts/backfill_postgres.py` | One-time JSONL/JSON -> Postgres migration for an existing environment |
| `requirements.txt` | Python deps (SendGrid, SQLAlchemy, asyncpg, Alembic, FastAPI) |
| `.env` | Secrets (not in git) |

### Root

| Path | Role |
|------|------|
| `backend_test.py` | POST/GET API smoke tests |
| `design_guidelines.json` | Brand tokens + layout rules (some fonts differ from live `App.js`) |
| `graphify-out/` | Generated knowledge graph; safe to regenerate |
| `test_reports/` | Past agent test iteration JSON logs |

## Data flows

### Contact form

```
User fills form (Home section or Contact)
  → axios POST REACT_APP_BACKEND_URL/api/contact
  → FastAPI validates ContactFormRequest
  → background_tasks.add_task(send_contact_email, ...)
  → SendGrid Mail(from=SENDER_EMAIL, to=RECIPIENT_EMAIL, reply_to=user)
  → 200 { status: "success", message: "..." }
```

Budget range is **not** a separate API field; frontend appends it to `message`.

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

## Design source of truth

When PRD, `design_guidelines.json`, and `App.js` disagree, **follow `App.js` for the live site**.

Canonical live palette:
- Background: black / near-black
- Accent: cyan `#00F5FF`, violet `#7C3AED`
- Typography: Space Grotesk + Inter (Google Fonts in `App.css` / index)

`design_guidelines.json` lists Plus Jakarta Sans and `#3B82F6` primary; treat as aspirational unless migrating the whole site.

## Known tech debt

1. **Monolithic `App.js`** — hard to navigate; extract components only when asked
2. **JS vs TS** — README describes TS/shadcn TS patterns; repo uses JSX
3. **Email domain** — codebase uses `@softogram.com`; confirm with owner before changing to `.in`
4. **Admin auth still single-password** — `admin_users`/`admin_sessions` tables exist (Phase 10 migration) but auth doesn't use them yet; that cutover is Phase 11
5. **Blog/case studies** — marketing placeholders, not backed by API or MD files
6. **Large agent skill trees** in `.cursor/skills` — not part of deploy artifact

## Deployment notes

- Frontend: static build via `yarn build` (CRACO)
- Backend: uvicorn/gunicorn; needs SendGrid + CORS_ORIGINS for production domain
- Preview URL referenced in tests: `code-delivered.preview.emergentagent.com`

## Commands cheat sheet

```bash
# Frontend dev
cd frontend && yarn start

# Backend dev
cd backend && uvicorn server:app --reload --port 8000

# API tests
python backend_test.py

# Refresh knowledge graph after edits
graphify update .
```

## What not to do

- Do not bulk-migrate `App.js` to TypeScript or split files without explicit request
- Do not reintroduce MongoDB; Postgres is the primary store as of Phase 10
- Do not change brand colors/fonts casually; consistency is a selling point
- Do not commit secrets or modify auto-generated changelogs
- Do not treat `graphify-out/` cache as hand-edited source

## Related docs

- `memory/PRD.md` — personas, features shipped, prioritized backlog
- `CLAUDE.md` — agent briefing (stack, conventions, graphify)
- `design_guidelines.json` — design tokens and section layout hints
- `graphify-out/GRAPH_REPORT.md` — codebase graph audit (god nodes, communities)
