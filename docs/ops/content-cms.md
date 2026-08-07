# Content CMS (issue #17)

## Done in code
- Seeded blog (4 launch posts) + case studies with metrics in `backend/content/`
- Public API: `GET /api/content/blog`, `/blog/{slug}`, `/projects`
- Password admin: `POST /api/admin/login` + CRUD PUT under `/api/admin/*`
- UI at `/admin` (session token in `sessionStorage`)
- Public blog / client-work pages fetch CMS with static fallback
- Per-post OG + `BlogPosting` JSON-LD via `SeoHead`
- Sitemap lists the four launch posts

## Ops
1. Set a strong `ADMIN_PASSWORD` in production API env.
2. Prefer writing CMS data on a persistent volume (`LEADS_DATA_DIR` / `backend/data`).
3. Publish cadence: aim for 2 posts/month; share on LinkedIn company page.
4. Do not expose `/admin` in marketing nav (already omitted).
