## Goal
Port redesign Layout (nav + footer) and scaffold routes — home still can show transitional content, but chrome is redesign.

## Depends on
Phase 0 (# this epic — foundations)

## Source
`Redesign-Softogram-Website/src/components/Layout.tsx`, `routes.tsx` NotFound

## Work
1. Port Layout → JSX with LogoMono; branch dropdown optional or simplified
2. Wire into App router; keep policy routes
3. Add routes: `/products`, `/client-work`, `/blog/:slug` (placeholder pages OK)
4. Redirect `/case-studies` → `/client-work`
5. Port branded 404 catch-all → closes #19
6. `data-testid`s: `navbar`, `footer`, `not-found-page`, nav links

## Acceptance
- [ ] Nav/footer match redesign on all routes
- [ ] Policy pages still reachable
- [ ] Unknown URL shows branded 404 (enables / closes #19)
- [ ] E2E nav/route smokes updated and green

## Labels intent
P1, redesign, growth, agent-ready
