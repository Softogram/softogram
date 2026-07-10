# Softogram

Official marketing website for **Softogram**, a software development company.
Tagline: **"Your idea. Our code. Delivered."**

The site is a premium dark-themed landing page with pricing, portfolio, case studies, contact form (SendGrid), and legal policy pages.
Blog and case-study routes exist with static placeholder content; full CMS-style blogging is not built yet.

## Repository layout

```
softogram/
├── frontend/          # React 19 SPA (Create React App + CRACO)
├── backend/           # FastAPI API (contact form, SendGrid email)
├── memory/            # Product + technical memory (read PRD.md and PROJECT.md)
├── design_guidelines.json
├── backend_test.py    # API integration tests
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
| Backend | FastAPI, Pydantic v2, Motor (MongoDB client), SendGrid |
| Testing | `backend_test.py` (requests-based API tests), `data-testid` on interactive UI elements |

## Brand and design (canonical)

Follow what ships in `frontend/src/App.js` and `design_guidelines.json`, not stale notes elsewhere.

- **Theme**: Dark glassmorphism, dot-pattern hero, neon glow on hover
- **Colors**: Pure black background, cyan `#00F5FF`, violet `#7C3AED`
- **Fonts**: Space Grotesk (headings), Inter (body) in the live site; `design_guidelines.json` also references Plus Jakarta Sans for headings when adding new sections
- **UI**: shadcn/ui components live in `frontend/src/components/ui/`
- **Icons**: Lucide React only
- **Motion**: Framer Motion for section reveals; `react-countup` for stats; `react-fast-marquee` for testimonials

When adding UI, match existing patterns: glass cards (`bg-white/5 border border-white/10 backdrop-blur-md`), cyan hover accents, generous padding, `data-testid` on every interactive element.

## Application architecture

**Monolithic frontend**: Nearly all pages and sections live in `frontend/src/App.js` (~2,400 lines).
Routes: `/`, `/case-studies`, `/blog`, `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/cookie-policy`.

**Backend** (`backend/server.py`):
- `GET /api/` — health message
- `POST /api/contact` — contact form; sends email via SendGrid in a background task
- `GET /api/status` — MongoDB status checks (legacy; contact submissions are not persisted)

Contact form posts `{ name, email, phone, service, message }`.
Budget range is appended to `message` on the client before POST.

**Email**: `SENDER_EMAIL` → `RECIPIENT_EMAIL` via SendGrid.
`reply_to` is set to the submitter's email.
MongoDB save for contact submissions is intentionally commented out.

**Canonical contact email in code**: `support@softogram.com`

## Environment variables

**Frontend** (`frontend/.env` or build-time):
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```
SENDGRID_API_KEY=
SENDER_EMAIL=support@softogram.com
RECIPIENT_EMAIL=support@softogram.com
CORS_ORIGINS=http://localhost:3000
MONGO_URL=mongodb://localhost:27017
DB_NAME=softogram_db
```

Never commit real API keys.
Warn if asked to commit `.env` files.

## Local development

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Frontend
cd frontend && yarn install && yarn start
```

Optional: `ENABLE_HEALTH_CHECK=true` in frontend env enables CRACO webpack health plugin.

## Code conventions

- **Frontend**: Functional React components, hooks, Tailwind utility classes, `cn()` from `@/lib/utils` for class merging
- **Backend**: Async FastAPI routes, Pydantic models, background tasks for email (do not block the HTTP response on SendGrid)
- **Scope**: Minimal diffs; do not refactor `App.js` into modules unless explicitly asked
- **Dependencies**: Match existing stack; do not introduce TypeScript or Next.js without explicit approval
- **Emergent**: `@emergentbase/visual-edits` wraps CRACO in dev mode only; do not break that integration

## Testing

- **E2E suite (primary)**: `cd e2e && npm test` — Playwright drives the real frontend + backend with SendGrid mocked locally; see `e2e/README.md` and `docs/testing/e2e-framework.md`
- Legacy API tests: `python backend_test.py` (defaults to preview URL; override base URL as needed)
- New interactive UI must include `data-testid` attributes (project standard from `design_guidelines.json`)
- Bug fixes must add or flip a test that fails before the fix (several `test.fixme` entries already encode open issues)
- Fix lint/test failures you encounter, even if unrelated to the current task

## Issue backlog and audits

- GitHub issues on `nomotomo/softogram` are the canonical backlog; labels: `P0/P1/P2`, `security`, `email`, `growth`, `seo`, `performance`, `testing`, `ops`, `agent-ready`
- Working an issue: follow `.claude/skills/issue-workflow/SKILL.md`
- Audit and plan docs behind the issues: `docs/audit/security-audit-2026-07.md`, `docs/audit/email-integration-2026-07.md`, `docs/growth/growth-plan-2026-07.md`

## graphify (codebase knowledge graph)

`graphify-out/` contains an indexed knowledge graph of this repo.

- For focused questions: `graphify query "<question>"` (preferred over grepping)
- For relationships: `graphify path "<A>" "<B>"`
- For a concept: `graphify explain "<concept>"`
- After code changes: `graphify update .` (incremental, AST-only for code-only diffs)
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review

## Product backlog (summary)

See `memory/PRD.md` for full PRD and prioritized backlog.

**P0 (production)**: Real SendGrid key, real phone/WhatsApp numbers, real social URLs
**P1**: SEO meta/OG tags, favicon polish, portfolio links, analytics
**P2**: Blog CMS, cookie consent, live chat, dark/light toggle

## Agent priorities

1. Preserve the premium dark brand aesthetic on every UI change
2. Keep contact form → SendGrid flow working end-to-end
3. Prefer extending `App.js` patterns over new abstractions
4. Use `memory/PROJECT.md` for file-level map and known tech debt
5. Query graphify before large exploratory reads of the codebase
