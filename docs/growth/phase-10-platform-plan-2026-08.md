# Phase 10+ Platform Plan - August 2026

Companion to [`growth-plan-2026-07.md`](./growth-plan-2026-07.md) and [`../redesign/integration-plan-2026-08.md`](../redesign/integration-plan-2026-08.md).
Scope: Postgres as the primary database, an admin dashboard with real analytics, and a full blogging platform with comments and sharing.
This is a plan only.
Nothing described below has been implemented yet; implementation is a separate, later pass.

## Current state (verified 2026-08-07)

Confirmed by reading the codebase, checking `git log`, checking the GitHub issue tracker, and running both services locally end to end.

- Aug 2026 redesign (Phase 0-9, GitHub-dark theme): shipped.
- Security hardening (CORS fail-closed, contact rate-limit, honeypot, security headers, secrets hygiene): shipped.
- Growth/conversion fixes (international WhatsApp link, lead auto-reply, SendGrid retries, PostHog + consent banner): shipped.
- File-based content CMS (`/admin`, password-gated blog + case-study CRUD): shipped.
- Only one open item in the tracker: TLS renewal on `api.softogram.in` (P0, in progress separately via Cursor).

## Gap analysis

### 1. Postgres as the primary database

Today: MongoDB is wired in via `Motor` but barely used.
Every write is best-effort, wrapped in a try/except that logs and moves on.
The data that actually matters lives in flat files: `backend/data/contact_leads.jsonl` and two hand-rolled JSON files (`cms_blogs.json`, `cms_projects.json`) guarded by a Python threading lock in `backend/cms.py`.

Proposed: drop MongoDB entirely.
PostgreSQL via SQLAlchemy 2.0 (async) and Alembic migrations.
Run locally in Docker Compose now.
Cut over to RDS later without a rewrite, since the migrations and SQL are portable to any Postgres host.

### 2. Admin dashboard and analytics

Today: one shared password in an env var (`ADMIN_PASSWORD`).
Login tokens live in an in-memory Python dict (`content_cms._sessions`), so every backend restart or deploy silently logs the admin out.
No audit trail, no second admin account possible, and no analytics inside `/admin` at all.
Leads only exist as lines in a log file on the server.

Proposed: a real `admin_users` table (hashed passwords) plus a `admin_sessions` table backed by Postgres, so sessions survive restarts.
A dashboard tab with a leads pipeline (new / contacted / won / lost) sourced from Postgres.
Traffic and funnel charts pulled server-side from the PostHog API (already installed, free tier), rendered with `recharts` (already a frontend dependency).

### 3. Blogging: shareable, readable, commentable

Today: posting and editing already works through `/admin`.
Comments do not exist.
There is no share button.
The editor is a plain textarea with no live preview.

**Confirmed bug found during this review:** shared blog links do not unfurl correctly.
`frontend/src/components/redesign/SeoHead.jsx` sets each post's title, description, and image via a React `useEffect`, so the correct tags only exist after JavaScript runs.
WhatsApp, LinkedIn, and X's link-preview bots do not run JavaScript.
Today, when someone shares a blog post link, those platforms fetch the raw HTML shell and show the generic homepage title and image instead of the actual post.
Since easy sharing is an explicit goal for the blog, this needs a fix, not a rebuild: detect known crawler user agents and serve pre-rendered meta tags for that specific post (from the FastAPI content API), while regular visitors keep getting the normal SPA.

Proposed: a `blog_comments` table with a moderation queue, reusing the existing honeypot and rate-limit pattern from the contact form.
WhatsApp, LinkedIn, and X share buttons, plus copy-link.
A markdown editor with live preview.
An RSS feed.
The OG-tag crawler fix described above.

## Proposed Postgres schema

| Table | Purpose | Replaces |
|---|---|---|
| `leads` | Contact form submissions, with a status pipeline | `contact_leads.jsonl` + unused Mongo insert |
| `admin_users` | Hashed passwords (argon2), one row per admin | single `ADMIN_PASSWORD` env var |
| `admin_sessions` | Login tokens, survive backend restarts | in-memory Python dict |
| `blog_posts` | Title, slug, markdown content, tags, published flag, view_count | `cms_blogs.json` |
| `blog_comments` | post_id, name, comment, approved flag, created_at | nothing, new feature |
| `projects` | Case studies / client work entries | `cms_projects.json` |
| `newsletter_subscribers` | Email capture from the exit-intent lead magnet (see growth plan section 4) | nothing, new feature |

Dependency diff for `backend/requirements.txt`:

```diff
 fastapi>=0.115.0,<0.142
 uvicorn[standard]>=0.30.0,<0.36
-motor>=3.3,<4
+sqlalchemy[asyncio]>=2.0,<3
+asyncpg>=0.29
+alembic>=1.13
+passlib[argon2]>=1.7
 sendgrid>=6.11,<7
```

## Growth research addendum (August 2026)

Cross-checked against `growth-plan-2026-07.md`, which already covers most conversion and SEO leaks.
What is new below is what current research adds on top of that plan.

- **Analytics tooling decision**: no second analytics tool needed. PostHog's free tier already covers pageviews, funnels, and session replay. Surface that data inside the admin dashboard instead of self-hosting Umami or Matomo.
- **Comments decision**: GitHub-based comment tools (giscus) require a GitHub login, which fits developer blogs but not Softogram's actual audience of SMB owners and startup founders. A simple owned `blog_comments` table with moderation fits the audience better.
- **AEO/GEO**: 2026 sources emphasize that leads increasingly originate from AI answer engines (ChatGPT, Perplexity), not just Google search. Structuring blog posts as direct, citable answers (clear headers, defined terms, real numbers) supports this; the existing content plan already leans this way.
- **RSS feed**: cheap to add once posts live in Postgres. Gives directories, aggregators, and AI crawlers a clean structured feed instead of scraping the SPA.
- **Directory listings and Search Console**: Clutch, GoodFirms, Google Business Profile, and Search Console registration remain free and still open per the July growth plan; nothing new here, just re-confirmed as still outstanding.

## Cost (kept deliberately low)

| Piece | Now | Monthly cost |
|---|---|---|
| Postgres (local dev) | Docker Compose on your machine | $0 |
| Postgres (production, your stated path) | AWS RDS db.t4g.micro, ap-south-1, single-AZ | $0 for 12 months free tier, then approximately $13-15 |
| Postgres (cheaper alternative, worth 5 minutes of comparison) | Neon, free tier has no expiry, scales to zero when idle | $0 indefinitely at this traffic size |
| Analytics | PostHog free tier (1M events/month) | $0 |
| Directory listings + Search Console | Clutch, GoodFirms, Google Business Profile | $0 |
| Uptime + TLS monitoring | UptimeRobot free tier | $0 |

RDS stays the default since that is what was asked for.
Neon is listed only because at current traffic it would cost nothing indefinitely with no server to patch, not as a push to change the decision.

## Roadmap

Ordered so nothing gets built twice: Postgres has to land before the dashboard or comments can be built on top of it.

1. **Phase 10 - Postgres foundations.** Docker Compose Postgres, SQLAlchemy models, Alembic migrations. Backfill script moves existing JSONL leads and CMS JSON into real tables. Remove Motor/MongoDB from the codebase entirely.
2. **Phase 11 - Admin auth hardening.** `admin_users` and `admin_sessions` tables, hashed passwords, a seed script for the first account. Old shared-password login retired.
3. **Phase 12 - Admin dashboard v2.** Leads pipeline UI, markdown editor with live preview, image upload, and an analytics tab combining PostHog data with Postgres-sourced lead/content metrics, charted with `recharts`.
4. **Phase 13 - Blogging platform.** Comments with a moderation queue, share buttons, the OG-crawler fix, RSS feed, reading time, related posts.
5. **Phase 14 - Growth push.** Search Console, directory listings, a Cal.com booking button, uptime/TLS monitoring, newsletter capture tied to the exit-intent lead magnet from the July growth plan.
6. **Phase 15 - RDS cutover.** Provision RDS, run the same Alembic migrations against it, dump/restore data, cut over via an env var. Timed to when local disk or scale actually demands it, not before.

## Tracking

Every line item below is a GitHub issue (label `platform`) on `nomotomo/softogram`.
Work through them in order; later phases depend on earlier ones being done first.

### Phase 10 - Postgres foundations

Implemented in [PR #54](https://github.com/Softogram/softogram/pull/54) - pending review/merge.

- [x] [#31 Docker Compose Postgres + SQLAlchemy async engine](https://github.com/Softogram/softogram/issues/31)
- [x] [#32 Alembic migrations + initial schema](https://github.com/Softogram/softogram/issues/32)
- [x] [#33 Backfill leads and CMS content into Postgres](https://github.com/Softogram/softogram/issues/33) - scope grew to include the actual read/write cutover, not just a one-time copy
- [x] [#34 Remove MongoDB and Motor from the codebase](https://github.com/Softogram/softogram/issues/34)

### Phase 11 - Admin auth hardening

- [ ] [#35 admin_users table with argon2-hashed passwords](https://github.com/Softogram/softogram/issues/35)
- [ ] [#36 Postgres-backed admin sessions](https://github.com/Softogram/softogram/issues/36)
- [ ] [#37 Retire the shared ADMIN_PASSWORD login flow](https://github.com/Softogram/softogram/issues/37)

### Phase 12 - Admin dashboard v2

Implemented in [PR #59](https://github.com/Softogram/softogram/pull/59) - pending review/merge.

- [x] [#38 Leads pipeline UI in the admin dashboard](https://github.com/Softogram/softogram/issues/38)
- [x] [#39 Markdown editor with live preview + image upload](https://github.com/Softogram/softogram/issues/39) - also fixed the public blog page's markdown rendering (was silently broken)
- [x] [#40 Analytics tab: PostHog API + recharts](https://github.com/Softogram/softogram/issues/40) - PostHog side not yet verified against a live account (none existed at implementation time)

### Phase 13 - Blogging platform

- [x] [#41 Fix blog OG/share tags not rendering for crawlers](https://github.com/Softogram/softogram/issues/41) - API `share.html` + Cloudflare Worker in `workers/blog-og/` (deploy is a human ops step)
- [x] [#42 blog_comments schema + moderated comment API](https://github.com/Softogram/softogram/issues/42)
- [x] [#43 Comment UI on blog posts + moderation queue in admin](https://github.com/Softogram/softogram/issues/43)
- [x] [#44 Share buttons on blog posts](https://github.com/Softogram/softogram/issues/44)
- [x] [#45 RSS feed for blog posts](https://github.com/Softogram/softogram/issues/45)

### Phase 14 - Growth push

- [ ] [#46 Register Google Search Console + submit sitemap](https://github.com/Softogram/softogram/issues/46) - needs your hands, not just an agent's
- [ ] [#47 List Softogram on Clutch, GoodFirms, Google Business Profile](https://github.com/Softogram/softogram/issues/47) - needs your hands, not just an agent's
- [ ] [#48 Cal.com booking button on site](https://github.com/Softogram/softogram/issues/48)
- [ ] [#49 Uptime + TLS expiry monitoring](https://github.com/Softogram/softogram/issues/49) - needs your hands, not just an agent's
- [ ] [#50 Newsletter capture + exit-intent lead magnet](https://github.com/Softogram/softogram/issues/50)

### Phase 15 - RDS cutover

- [ ] [#51 Provision AWS RDS Postgres and run migrations against it](https://github.com/Softogram/softogram/issues/51) - needs AWS account access
- [ ] [#52 Cut production over to RDS](https://github.com/Softogram/softogram/issues/52)

### Backlog

- [ ] [#53 Role-based admin access (admin_users.role)](https://github.com/Softogram/softogram/issues/53) - do not start until a second admin is actually being added

## Decisions (confirmed 2026-08-07)

- **Local Postgres runs via Docker Compose**, not a native Homebrew install. This matches RDS's version and config exactly, so the Phase 15 cutover is a data copy, not a rewrite.
- **Comments require approval before they go live.** New comments land in a moderation queue inside the Phase 12 admin dashboard.
- **Single admin account for now.** `admin_users` is built as a table, not a single env var, specifically so adding a second person later is a one-row insert, not a migration.

## Backlog: role-based admin access

Out of scope for Phase 11.
When a second admin joins, revisit `admin_users.role` (for example: owner, editor, moderator) and gate the dashboard's write actions accordingly.
Worth its own ticket once there is a real second person to design permissions around, rather than guessing roles today.

## Sources

- [Self-Hosted Web Analytics 2026 - OpenPanel](https://openpanel.dev/articles/self-hosted-web-analytics)
- [8 best open source analytics tools you can self-host - PostHog](https://posthog.com/blog/best-open-source-analytics-tools)
- [PostgreSQL Hosting Options in 2026: Pricing Comparison - Bytebase](https://www.bytebase.com/blog/postgres-hosting-options-pricing-comparison/)
- [Best PostgreSQL Hosting in 2026: RDS vs Supabase vs Neon vs Self-Hosted](https://dev.to/philip_mcclarence_2ef9475/best-postgresql-hosting-in-2026-rds-vs-supabase-vs-neon-vs-self-hosted-5fkp)
- [Managed PostgreSQL Comparison 2026](https://selfhost.dev/blog/managed-postgresql-comparison-2026/)
- [giscus - a commenting system powered by GitHub Discussions](https://giscus.app/)
- [7 Essential Strategies For AEO, SEO, GEO Lead Generation In 2026](https://saltechsystems.com/the-2026-lead-generation-playbook-seo-aeo-geo/)
- [SEO for lead generation: A complete strategy guide for 2026 - Ingeniom](https://www.ingeniom.com/post/seo-for-lead-generation-complete-strategy-guide-2026)
