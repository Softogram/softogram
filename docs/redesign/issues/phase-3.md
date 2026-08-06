## Goal
Port Terminal interactive demo + Build Log sections onto the redesign Home page.

## Source
`components/Terminal.tsx`, Home build-log section, `hooks/useScrollReveal.ts`

## Work
1. Port Terminal typewriter widget (JSX)
2. Port Build Log expandable rows
3. Port useScrollReveal / count-up hooks as needed
4. Sticky pane headers per redesign
5. E2E: Terminal / build-log sections present (`data-testid`)

## Acceptance
- [ ] Terminal animation plays; Build Log expands
- [ ] No three.js dependency introduced
- [ ] E2E asserts sections exist

## Labels intent
P1, redesign, growth, agent-ready
