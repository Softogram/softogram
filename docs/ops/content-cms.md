# Content CMS (issue #17; storage migrated to Postgres in Phase 10)

## Done in code
- `blog_posts` / `projects` tables in Postgres, auto-seeded from `backend/content/seed_*.json` on first boot if empty (see `cms.ensure_seeded()`)
- Public API: `GET /api/content/blog`, `/blog/{slug}`, `/projects`
- Password admin: `POST /api/admin/login` + CRUD PUT under `/api/admin/*` (still the env-password + in-memory session mechanism - Postgres-backed `admin_users`/`admin_sessions` is Phase 11)
- UI at `/admin` (session token in `sessionStorage`)
- Public blog / client-work pages fetch CMS with static fallback
- Per-post OG + `BlogPosting` JSON-LD via `SeoHead`
- Sitemap lists the four launch posts

## Ops
1. Set a strong `ADMIN_PASSWORD` in production API env.
2. Content lives in Postgres now, not flat files - back up the database, not a directory.
3. Migrating an environment that still has real edits in the old `backend/data/cms_blogs.json` / `cms_projects.json`? Run `cd backend && .venv/bin/python scripts/backfill_postgres.py` once before cutover.
4. Publish cadence: aim for 2 posts/month; share on LinkedIn company page.
5. Do not expose `/admin` in marketing nav (already omitted).
