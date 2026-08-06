## Goal
Port homepage Hero (headline, ClaimBlocks, CTAs, optional GitHub stars) and Contact section UI chrome. Contact API wiring can wait until Phase 4 if this PR is large — document choice in PR.

## Source
`Redesign-Softogram-Website/src/pages/Home.tsx` (hero + contact sections), ClaimBlock

## Work
1. Extract/port `Home` page shell with Hero + placeholders for later sections
2. Port hero aurora/gutter motif
3. Port contact card layout (fields ready for Phase 4 wire-up)
4. Preserve softogram contact email as `support@softogram.in` / plan from #11 once unified
5. `data-testid`s for hero + contact

## Acceptance
- [ ] Hero visually matches redesign on desktop + mobile
- [ ] Contact section renders; form submit behavior documented (wired or intentionally stubbed until Phase 4)
- [ ] E2E home smoke updated

## Labels intent
P1, redesign, growth, agent-ready
