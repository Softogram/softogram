# Softogram Website Redesign Integration Plan - August 2026

Port the Figma Make prototype at `Redesign-Softogram-Website/` into the existing CRA frontend under `frontend/`, while keeping the FastAPI backend, real contact → SendGrid pipeline, policy pages, and SEO baseline.

**Do not** replace CRA with the Vite app. We translate the redesign UI into `frontend/` piece by piece.

Source of truth for visual design: `Redesign-Softogram-Website/` (leave the folder in-repo as reference until the port is complete; do not import its Vite/Figma tooling into production).

---

## Owner decisions (2026-08-06)

| Decision | Choice |
|---|---|
| Integration style | Port redesign into existing CRA + FastAPI stack |
| Brand palette | Adopt redesign green `#4ADE80` + amber `#FB923C` on GitHub-dark — **supersedes** royal-blue migration in issue #20 |
| Wordmark | Mixed-case "Softogram" (carried from #20 decision) |
| Admin CMS (`/admin` + localStorage) | **Skip for early phases** — ship content as static JSX; CMS later if needed |
| Language | Stay **JavaScript/JSX** in `frontend/` (no TypeScript migration as part of this port) |
| UI libraries | Hand-rolled Tailwind like the redesign; do not add new component frameworks. Existing shadcn can stay unused until cleaned up |

---

## Source vs destination (what changes)

| Area | Current `frontend/` | Redesign | Integration result |
|---|---|---|---|
| Aesthetic | Cyan/violet glassmorphism, three.js hero | Green/amber GitHub-dark, diff gutters, CLI demo | Redesign aesthetic wins |
| Fonts | Space Grotesk + Inter | Fraunces + Outfit + JetBrains Mono | Redesign fonts |
| Home | Hero / Stats / Services / Pricing / Portfolio / Testimonials / Contact | Hero + Terminal + Build Log + Shipped + Services + Contact | Redesign sections; drop Pricing/Testimonials/three.js unless reintroduced later |
| Routes | `/`, `/case-studies`, `/blog`, policies | `/`, `/products`, `/client-work`, `/blog`, `/blog/:slug`, `/admin`, 404 | Keep policies; add `/products` + `/client-work`; map or redirect `/case-studies` → `/client-work`; defer `/admin` |
| Contact | Real API + SendGrid (currently blocked by TLS #1) | UI-only fake submit | **Wire redesign form to** `POST /api/contact` |
| Logo | Cyan brackets + waveform SVG | Green `</>` mono + PNG footer | Port redesign marks; tint with green palette; close #20 as superseded |
| Blog | Placeholder page | Full list + post + localStorage seed | Port list/post with **static seeded content** (no admin yet) — advances #17 |
| 404 | Blank page (#19) | Branded 404 exists | Port redesign 404 → closes #19 |
| SEO | Duplicate meta, placeholder JSON-LD (#13) | Minimal / robots noindex in Figma Make | Preserve & fix Softogram SEO while porting |

---

## Architecture approach

1. **Design tokens first** — add redesign colors/fonts to `frontend/src/index.css` (CRA uses Tailwind v3; map redesign `@theme` tokens to CSS variables + utility classes, do not upgrade to Tailwind v4 in this effort).
2. **Split components out of `App.js`** as we port — new files under `frontend/src/components/redesign/` and `frontend/src/pages/`. Keep routes in App (or a thin router file). This is one of the few places we *should* stop stuffing everything into `App.js`.
3. **TSX → JSX** translation when copying. Inline styles and Tailwind classes can mostly copy as-is after token aliases exist.
4. **Every interactive element gets `data-testid`** (project rule). Update/add E2E specs per phase.
5. **Backend untouched** except env/CORS as needed for local + production origins. Contact hardening issues (#3–#5, #8, #11) remain separate but apply to the wired form.
6. **Keep `Redesign-Softogram-Website/`** read-only reference until Phase Done; then archive/remove.

---

## Phased delivery (implement 1-by-1)

Each phase = one PR = one GitHub issue. Do not start Phase N+1 until N is merged/verified.

### Phase 0 — Foundations & brand lock
- CSS variables for green/amber/GitHub-dark surfaces
- Fonts (Fraunces, Outfit, JetBrains Mono) in `public/index.html` or CSS import
- Shared primitives: gutter row, badge, claim-block, logo mono
- Document that issue #20 (royal blue) is **superseded**
- E2E still must pass on smoke (or skip until sections ship)

### Phase 1 — Layout shell (nav + footer + routes scaffolding)
- Port `Layout.tsx` → JSX nav/footer
- Register routes: `/products`, `/client-work`, `/blog/:slug`, catch-all 404 placeholders
- Redirect `/case-studies` → `/client-work`
- Keep existing policy routes working

### Phase 2 — Home: Hero + Contact form shell
- Port hero (headline, claim blocks, CTAs, optional GitHub stars fetch)
- Port contact section UI (not wired yet, or wire stub that still posts to API)
Prefer wiring in Phase 4 if Phase 2 is already large

### Phase 3 — Home: Terminal + Build Log
- Port `Terminal` typewriter widget and Build Log accordion
- Scroll-reveal hooks (`useScrollReveal`)

### Phase 4 — Home: Shipped + Services + wire Contact → API
- Port “What We’ve Shipped” and Services rows
- Wire contact form to `${REACT_APP_BACKEND_URL}/api/contact` with existing payload shape (`name`, `email`, `phone`, `service`, `message`)
  - Redesign lacks phone — add a phone field or map “type” chips into `service` and keep phone optional? **Plan: add phone as required to match backend contract + current validation**, map type chips → `service`
- Preserve toast success/error UX
- E2E contact-form path must pass against SendGrid mock

### Phase 5 — Products page
- Port `/products` catalog + detail modal with static data from redesign seeds

### Phase 6 — Client Work page
- Port `/client-work` (case studies); deprecate old `/case-studies` UI (redirect already in Phase 1)
- Advances growth/trust goals from #16 / #17

### Phase 7 — Blog list + post (static)
- Port `/blog` and `/blog/:slug` with seeded posts (hardcoded or markdown-in-repo later)
- No `/admin`
- Advances #17

### Phase 8 — SEO, policies, polish
- Deduplicate meta (#13), fix JSON-LD, per-route titles
- Restyle policy pages to new tokens without rewriting legal copy
- Favicon + OG refresh for green brand
- Remove dead cyan glass CSS / three.js / unused shadcn later if unused (#14 largely moot)

### Phase 9 — E2E + CI alignment
- Rewrite selectors for new `data-testid`s
- Flip/remove obsolete `test.fixme`s where fixed
- Tie to #18 (GitHub Actions)

---

## Existing issue reuse map

| Issue | Relevance to redesign | Action |
|---|---|---|
| #1 TLS expired on api.softogram.in | Contact form still dead in prod | Keep P0 — **ops, outside UI port**; required before live leads work |
| #2 CORS wildcard | Still required when frontend ships | Keep; fix before production cutover |
| #3 Persist leads / retry email | Still P0 for contact reliability | Keep; independent of UI |
| #4–#5, #8 Email HTML escape, rate limit, validation | Apply to wired contact | Keep |
| #11 Email identity / DMARC | Keep | Keep |
| #12 WhatsApp country code | Redesign may not have WhatsApp float | Close as N/A if button removed; else fix |
| #13 SEO meta | Must do during Phase 8 | Keep / schedule with Phase 8 |
| #14 three.js performance | Redesign has no three.js | Close or retarget to “remove three.js when old hero dies” |
| #16 Conversion / testimonials | Redesign substitutes Shipped + honesty claims | Partially superseded by Phases 4–6 |
| #17 Content engine | Blog + case studies | Partially delivered by Phases 6–7 |
| #18 E2E in CI | Phase 9 | Keep |
| #19 Blank 404 | Fixed by porting redesign 404 | Schedule with Phase 1 / resolve |
| #20 Royal blue logo | **Superseded** by green redesign palette | Comment + close once Phase 0 lands |

New issues: one per Phase 0–9 (see GitHub).

---

## Non-goals (this initiative)

- Migrating frontend to Vite / TypeScript / Tailwind v4
- Porting Figma Make plugins or `/admin` CMS in early phases
- Backend feature work beyond what contact wiring requires
- Keeping cyan glassmorphism as a parallel theme

---

## Definition of done (entire redesign)

- [ ] Site visual matches redesign on home + products + client-work + blog
- [ ] Contact submissions reach SendGrid mock in E2E and work against real API when cert/CORS are fixed
- [ ] Policy pages + SEO intact / improved
- [ ] 404 is branded
- [ ] Old cyan/three.js marketing UI removed or unreachable
- [ ] `cd e2e && npm test` green
- [ ] `Redesign-Softogram-Website/` archived or removed from serving path

---

## How to work each phase

1. Read this plan + the linked GitHub issue.
2. Copy from `Redesign-Softogram-Website/src/...`, convert to JSX, place under `frontend/src/...`.
3. Add `data-testid`s; extend `e2e/tests` for the new UI.
4. `cd e2e && npm test` before PR.
5. PR title: `redesign: Phase N — <name>` with `Closes #<issue>`.

See also: `docs/redesign/phase-checklist.md` for a short implementer checklist.

---

## Phase issue drafts (to publish on GitHub)

Bodies live at `docs/redesign/issues/phase-N.md`. Publish as GitHub issues labeled `redesign` + priority when filing is approved.

| Phase | Draft | Suggested title |
|---|---|---|
| 0 | `issues/phase-0.md` | [Redesign] Phase 0 — Foundations |
| 1 | `issues/phase-1.md` | [Redesign] Phase 1 — Layout shell + 404 |
| 2 | `issues/phase-2.md` | [Redesign] Phase 2 — Home Hero + Contact UI |
| 3 | `issues/phase-3.md` | [Redesign] Phase 3 — Terminal + Build Log |
| 4 | `issues/phase-4.md` | [Redesign] Phase 4 — Shipped + Services + Contact API |
| 5 | `issues/phase-5.md` | [Redesign] Phase 5 — Products |
| 6 | `issues/phase-6.md` | [Redesign] Phase 6 — Client Work |
| 7 | `issues/phase-7.md` | [Redesign] Phase 7 — Blog (static) |
| 8 | `issues/phase-8.md` | [Redesign] Phase 8 — SEO / policies / polish |
| 9 | `issues/phase-9.md` | [Redesign] Phase 9 — E2E + CI |

Suggested first implementation issue after docs land: **Phase 0**.
