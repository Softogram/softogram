## Goal
Port blog index + post pages with **static** seeded posts (no `/admin`). Partially delivers #17.

## Source
`pages/Blog.tsx`, `BlogPost.tsx`, default posts from `store.ts` → static module

## Work
1. Port list + slug post pages
2. Tag filter if present in redesign
3. Unique title/meta hooks for Phase 8 (#13)
4. E2E blog routes

## Acceptance
- [ ] `/blog` and `/blog/:slug` render real seeded content
- [ ] No admin/localStorage requirement
- [ ] E2E green
