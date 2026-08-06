# Redesign phase checklist (implementer)

Use with `docs/redesign/integration-plan-2026-08.md` and the matching GitHub issue.

## Before coding
- [ ] Confirm phase issue number and acceptance criteria
- [ ] Locate source files under `Redesign-Softogram-Website/src/`
- [ ] Note which existing Softogram routes/components will be replaced vs kept

## While coding
- [ ] Convert `.tsx` → `.jsx` (no new TypeScript in `frontend/`)
- [ ] Use redesign CSS tokens from `frontend/src/index.css` (Phase 0), not ad-hoc cyan/violet
- [ ] Put new UI under `frontend/src/components/redesign/` and `frontend/src/pages/`
- [ ] Add `data-testid` on interactive / assertable elements
- [ ] Keep FastAPI contact contract: `name`, `email`, `phone`, `service`, `message` when wiring forms
- [ ] Do not port `/admin` unless a later phase explicitly asks for it

## Before PR
- [ ] Visual check: nav, footer, target section/page on desktop + mobile width
- [ ] `cd e2e && npm test`
- [ ] PR links `Closes #<phase-issue>` and lists any leftover human/ops work (#1 TLS, etc.)

## Source → destination cheatsheet

| Redesign | CRA destination (intended) |
|---|---|
| `index.css` `@theme` | `frontend/src/index.css` CSS variables + utilities |
| `components/Layout.tsx` | `frontend/src/components/redesign/Layout.jsx` |
| `components/LogoMono.tsx` | `frontend/src/components/redesign/LogoMono.jsx` |
| `components/Logo.tsx` | `frontend/src/components/redesign/Logo.jsx` + asset under `frontend/src/assets/` or `public/` |
| `components/Terminal.tsx` | `frontend/src/components/redesign/Terminal.jsx` |
| `components/Badge.tsx`, `ClaimBlock.tsx` | same folder |
| `hooks/useScrollReveal.ts` | `frontend/src/hooks/useScrollReveal.js` |
| `pages/Home.tsx` | `frontend/src/pages/Home.jsx` (sectionized) |
| `pages/Products.tsx` | `frontend/src/pages/Products.jsx` |
| `pages/ClientWork.tsx` | `frontend/src/pages/ClientWork.jsx` |
| `pages/Blog.tsx`, `BlogPost.tsx` | `frontend/src/pages/Blog.jsx`, `BlogPost.jsx` |
| `pages/Admin.tsx` / `store.ts` | **deferred** |
