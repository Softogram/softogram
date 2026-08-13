# Softogram Website - PRD

> Technical architecture and file map: see [`memory/PROJECT.md`](./PROJECT.md).
> Agent briefing: see [`CLAUDE.md`](../CLAUDE.md) at repo root.
> **The live backlog is GitHub issues on `Softogram/softogram`, not this file.**

## What this document is

Product framing and history: who the site is for, and how it got to where it is.
It is deliberately not a task list.
An earlier version of this file carried its own P0/P1/P2 lists, which drifted out of sync with the GitHub issues until the two disagreed about what was already built.
Priorities now live in one place only.

## Product

Marketing site for Softogram, a software development company.
Tagline: **"Your idea. Our code. Delivered."**

The positioning is verifiable honesty: every claim on the site should link to something a visitor can check for themselves - a live site, a GitHub release, a real commit.
This is a product constraint, not a style preference.
Multiple commits (`10ef6ad`, `a4353f9`) exist purely to strip fabricated testimonials, case studies, portfolio stats and product reviews that contradicted it.

## User personas

1. **SMB owners** - small and medium business owners in India looking for software development services
2. **Startup founders** - technically literate founders needing custom web applications
3. **E-commerce merchants** - business owners looking for online stores
4. **Enterprise clients** - companies needing AI automation, developer tooling, and internal systems

## Current architecture

| Layer | Stack |
|-------|-------|
| Frontend | React 19 (JavaScript, not TypeScript), Tailwind CSS 3, shadcn/ui, Framer Motion, React Router 7, built with CRA via CRACO |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic, Postgres |
| Email | **AWS SES** via `boto3` (`sesv2`) |
| Edge | CloudFront + S3, with a Lambda@Edge `viewer-request` function for crawler HTML and RSS |
| Testing | Playwright end-to-end suite in `e2e/` |

SendGrid was removed in `03bd2db`.
It appears in this document only as history.

## Current brand

Green GitHub-dark, shipped August 2026.
Background `#09090e`, accent green `#4ADE80`, amber `#FB923C`, card `#0d1117`.
Fonts: Fraunces (display), Outfit (body), JetBrains Mono (code and diff).

This **supersedes** the original cyan/violet glassmorphism brand described in the history below.
Cyan `#00F5FF` and violet `#7C3AED` are gone from the bundle entirely and must not be reintroduced.

## What is built

Public routes: `/`, `/products`, `/client-work`, `/blog`, `/blog/:slug`, four policy pages, and an admin dashboard at `/admin`.
`/case-studies` is a permanent redirect to `/client-work`.

- Contact form posting to FastAPI, emailing through SES, with leads persisted to Postgres
- Newsletter lead magnet and Cal.com booking
- **Blog and projects CMS** backed by Postgres, authored through `/admin`, with comments, moderation and an RSS feed
- Admin authentication with argon2 password hashing and hashed bearer sessions (Phase 11)
- Cookie consent, PostHog analytics, per-route SEO metadata and structured data
- CI/CD deploying to S3/CloudFront and EC2 on push to `main`

## History

Kept because it explains why some code looks the way it does.
None of it describes the current visual design.

### December 2025 - v2, premium dark theme
Pure black with cyan and violet accents, dot-pattern hero, stats counter, eight services, pricing cards, portfolio grid, testimonials marquee, glassmorphism navbar, Space Grotesk and Inter fonts.
Several of these sections carried invented numbers and testimonials, which were later removed.

### December 2025 - v3, case studies and policy pages
Redesigned logo, case studies section, the four legal policy pages, and social links.

### August 2026 - redesign
Ported `Redesign-Softogram-Website/` into the CRA app.
Replaced the cyan glassmorphism design entirely with the green GitHub-dark brand, restructured the monolithic `App.js` into `pages/` and `components/redesign/`, and added the products and client-work routes.

## Backlog

Tracked as GitHub issues on `Softogram/softogram`, labelled `P0`/`P1`/`P2` plus `security`, `growth`, `seo`, `performance`, `testing`, `ops` and `agent-ready`.

Do not maintain a duplicate list here.
If this file and the issues ever disagree, the issues are correct.
