## Goal
Port `/products` SaaS/product catalog page with static seeded data from the redesign.

## Source
`Redesign-Softogram-Website/src/pages/Products.tsx` (+ seed products from `store.ts` defaults — **as static consts**, not localStorage)

## Work
1. Port Products page + modal as JSX
2. Seed data hardcoded in module (no `/admin`)
3. Link from Home “Shipped” / nav
4. `data-testid`s + E2E route smoke

## Acceptance
- [ ] `/products` matches redesign; modal works
- [ ] No localStorage CMS dependency
- [ ] E2E green
