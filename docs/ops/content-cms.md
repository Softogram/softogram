# Content CMS (issue #17; storage migrated to Postgres in Phase 10; auth hardened in Phase 11)

## Done in code
- `blog_posts` / `projects` tables in Postgres, auto-seeded from `backend/content/seed_*.json` on first boot if empty (see `cms.ensure_seeded()`)
- Public API: `GET /api/content/blog`, `/blog/{slug}`, `/projects`
- Admin auth (Phase 11): per-user email + argon2 password in `admin_users`; bearer tokens hashed (sha256) in `admin_sessions` (12h TTL, survive restarts)
- Admin CRUD under `/api/admin/*` (Bearer token from `POST /api/admin/login`)
- UI at `/admin` (session token in `sessionStorage`)
- Public blog / client-work pages fetch CMS with static fallback
- Per-post OG + `BlogPosting` JSON-LD via `SeoHead`
- Sitemap lists the four launch posts

## Ops — create the first admin

```bash
cd backend
.venv/bin/python scripts/seed_admin.py
# or non-interactive:
.venv/bin/python scripts/seed_admin.py --email you@softogram.in --password '...'
```

Then open `/admin`, sign in with that email + password.

CI/e2e can set `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD` so the API bootstraps a test admin on startup. Do not use those env vars in production.

## Other ops
1. Content lives in Postgres — back up the database, not a directory.
2. Migrating an environment that still has real edits in the old `backend/data/cms_blogs.json` / `cms_projects.json`? Run `cd backend && .venv/bin/python scripts/backfill_postgres.py` once before cutover.
3. Publish cadence: aim for 2 posts/month; share on LinkedIn company page.
4. Do not expose `/admin` in marketing nav (already omitted).
5. The shared `ADMIN_PASSWORD` env var is retired — remove it from any remaining host env if present.
