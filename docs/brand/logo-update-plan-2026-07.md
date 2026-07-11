# Logo Update Plan - July 2026

Plan to replace the current SVG logo on the Softogram site with the new brand logo.
Direction chosen with the owner: **adopt the new logo's colors site-wide** and evolve the accent palette accordingly.

## The new logo

Source: `softogram_logo.png` (2028x1504, provided 2026-06-29).
A downscaled reference is committed at `docs/brand/logo-2026-reference.png`.

- **Mark**: an abstract geometric form built from two royal-blue chevron/arrow strokes with a cream-white forward slash cutting diagonally through the center (reads as a stylized "S" / a `/` code slash / a play-forward motion).
- **Wordmark**: "SOFTOGRAM" in a bold, uppercase, rounded geometric sans, royal blue.
- **Sampled colors** (measured from the asset):

  | Role | Hex | Notes |
  |---|---|---|
  | Primary blue (mark + wordmark) | `#2561CD` | deepest blue, used for the wordmark |
  | Mark blue (lit faces) | `#3C7ACE` | the 3D-rendered chevron faces |
  | Cream / off-white slash | `#F1EADF` | the diagonal accent stroke |
  | Background in the render | `#141414` | near-black, consistent with the site |

The render is a 3D "sign on wall" mockup; we do **not** use the raster. We rebuild the mark as clean vector (SVG) for crisp rendering at every size.

## What exists today

The current logo is an inline React component, not an asset file:

- `SoftogramLogo` component in `frontend/src/App.js:88-159` - an inline SVG of two code brackets `< >` with a signal/heartbeat waveform and an animated cyan core dot, plus a "Softo**gram**" wordmark where "gram" uses a cyan-to-violet gradient.
- Used in two places: navbar (`App.js:275`, size `small`) and footer (`App.js:1518`, size `default`, with tagline).
- `frontend/public/favicon.svg` - a standalone SVG of the same brackets-and-waveform mark on a black square.
- JSON-LD in `frontend/public/index.html` references a `logo.png` that does not exist.

## Color decision and its blast radius

The site's entire accent system is neon **cyan `#00F5FF`** + **violet `#7C3AED`**.
The new logo is royal **blue** + **cream**.
Dropping the blue logo into the cyan site unchanged would clash with every button, glow, and hover state.

Owner decision: **migrate the palette to the logo.**
This is the larger but coherent path.
Scope of the accent color (from a repo scan):

- `frontend/src/index.css`: CSS variables `--accent-cyan`, `--accent-violet`, `--glow-cyan*` drive ~30 utility rules (buttons, glows, borders, gradients, orbs, code syntax).
- `frontend/src/App.js`: ~51 `cyan-400`, ~16 `cyan-500`, ~10 `violet-500`, ~4 `violet-600` Tailwind classes, plus 6 raw hex uses.
- `design_guidelines.json` and `CLAUDE.md` document the old palette (must be updated so future work does not reintroduce cyan).

### New palette (proposed)

| Token | Old | New | Contrast on black |
|---|---|---|---|
| `--accent-primary` | `#00F5FF` | `#3C7ACE` (or lighter `#5B8DEF` for text/icons) | 4.87 / 6.50 |
| `--accent-secondary` | `#7C3AED` | `#2561CD` (deep blue) | 3.67 |
| `--accent-highlight` | (none) | `#F1EADF` (cream) | 17.57 |
| glow | cyan glow | `rgba(60,122,206,0.4)` blue glow | - |

Accessibility note: the deep wordmark blue `#2561CD` is **3.67:1 on black**, which fails WCAG AA (4.5:1) for normal-size body text.
Use it for large text and fills only; for small text, icons, and links use `#5B8DEF` (6.50:1) or the cream `#F1EADF`.
The gradient direction becomes blue -> lighter-blue (or blue -> cream) instead of cyan -> violet.
This keeps the "glassmorphism + glow" aesthetic; only the hue shifts.

## Deliverables

1. **Vector rebuild of the mark**: a clean `frontend/public/logo-mark.svg` reconstructing the chevron + slash geometry (not traced from the 3D render). Two color variants:
   - full-color (blue chevrons + cream slash) for dark backgrounds,
   - monochrome for edge cases (email, print, favicon fallback).
2. **New `SoftogramLogo` component**: replace the brackets-and-waveform SVG in `App.js:88-159` with the new mark; update the wordmark to uppercase "SOFTOGRAM" in the new blue (keep the gradient treatment but in the new palette). Preserve the `size` and `showTagline` props and `data-testid="logo-link"` so nothing else breaks.
3. **Favicon + PWA icons**: regenerate `frontend/public/favicon.svg` from the new mark; add `favicon-32.png`, `apple-touch-icon.png` (180x180), and `icon-192/512.png` for a web manifest.
4. **OG/social image**: refresh `frontend/public/og-banner.png` with the new logo; fix the JSON-LD `logo` reference to point at a real file (ties into SEO issue #13).
5. **Palette migration**: update `index.css` variables, then sweep `App.js` Tailwind classes cyan->blue. Do this via the CSS variables first (cheap) and treat the Tailwind class sweep as a follow-up pass so the diff stays reviewable.
6. **Docs**: update `design_guidelines.json` and `CLAUDE.md` brand section to the new palette so agents stop generating cyan UI.

## Sequencing (keeps each PR reviewable)

- **PR 1 - logo swap (visual, low risk)**: new mark SVG, new `SoftogramLogo` component, favicon set, OG image. Logo appears updated even before the palette moves. Small clash between blue logo and cyan CTAs is acceptable for a day.
- **PR 2 - palette migration**: flip `index.css` accent variables to blue, sweep Tailwind classes, update `design_guidelines.json` + `CLAUDE.md`. This is where the site becomes visually coherent.
- **PR 3 - polish**: verify glows/gradients read well, dark-mode contrast, and any place the old cyan leaked.

## Testing / verification

- Add `data-testid="site-logo"` to the mark and extend `e2e/tests/home.spec.js`: assert the logo renders in the navbar and footer, and that the favicon link resolves.
- Visual check with the `/run` skill (or Playwright screenshots) of navbar, hero, footer, and a policy page before/after each PR to catch contrast regressions.
- Run the full E2E suite (`cd e2e && npm test`) after each PR.
- Manual: favicon shows in the browser tab; OG image previews correctly in a share debugger.

## Open questions for the owner

1. The provided wordmark is **uppercase "SOFTOGRAM"**; the current site uses mixed-case "Softogram". Adopt uppercase in the header, or keep mixed-case wordmark with the new mark? (Plan assumes uppercase to match the asset.)
2. Do you have the **original vector** (AI/SVG/Figma) for the logo? If so we rebuild from that instead of reconstructing geometry from the raster, which is more faithful.
3. Keep the subtle **glow/animation** on the mark (the current logo has an animated pulsing core), or present the new mark flat?
