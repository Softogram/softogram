## Goal
Lock the redesign brand into the CRA frontend (green `#4ADE80` + amber `#FB923C` on GitHub-dark) and add shared primitives — **without** replacing homepage content yet.

## Source
- `Redesign-Softogram-Website/src/index.css` (`@theme` tokens + fonts)
- `components/Badge.tsx`, `ClaimBlock.tsx`, `LogoMono.tsx`, `Logo.tsx`
- Plan: `docs/redesign/integration-plan-2026-08.md` (Phase 0)

## Owner decisions
- Green palette **supersedes** royal-blue logo migration (#20) — comment and close #20 when this lands
- Mixed-case wordmark "Softogram"
- Stay JSX / Tailwind v3 (map tokens to CSS variables; do not upgrade to Tailwind v4)

## Work
1. Add CSS variables + utilities to `frontend/src/index.css` for redesign tokens
2. Load Fraunces / Outfit / JetBrains Mono
3. Port Badge, ClaimBlock, LogoMono, Logo → `frontend/src/components/redesign/` (JSX)
4. Copy logo PNG asset into frontend public/assets
5. Comment on #20 that it is superseded; close after merge
6. Update `CLAUDE.md` / `design_guidelines.json` brand section away from cyan/violet

## Acceptance
- [ ] Redesign tokens available and documented
- [ ] Primitives render in a temporary/story or Story-less smoke (importable without crashing)
- [ ] #20 marked superseded
- [ ] E2E suite still runnable (`cd e2e && npm test`)

## Labels intent
P1, redesign, growth, agent-ready
