# Softogram logo refresh and palette migration plan - July 2026

Decision (2026-07-11): adopt the new logo **and its royal blue + cream palette site-wide**, replacing the neon cyan/violet accent system.
Reference render: [`logo-2026-reference.png`](./logo-2026-reference.png) (original at higher resolution stays with the owner; the repo copy is the working reference).

## The new identity

- **Mark**: an "S" monogram formed by two mirrored triangular chevrons with double-stripe cuts, crossed by a rounded diagonal slash.
It reads simultaneously as an S, as forward/back arrows, and as a code slash, which fits "Your idea. Our code. Delivered."
- **Wordmark**: SOFTOGRAM in a bold geometric sans.
Recommend setting it in Space Grotesk Bold (the site's heading font) rather than tracing the mockup font, so the logo and site typography stay one system.

## Color system (sampled from the render, extended for accessibility)

The render's colors, with WCAG contrast on the site's pure-black background:

| Token | Hex | Contrast on #000 | Use |
|---|---|---|---|
| `brand-blue-deep` | `#2561CD` | 3.67:1 | Fills, large shapes, gradients. **Not for text** (fails AA). |
| `brand-blue` | `#3C7ACE` | 4.87:1 | Default accent: borders, icons, normal text >= 16px. |
| `brand-blue-light` | `#5B8DEF` | 6.50:1 | Links, small accent text, hover states. |
| `brand-cream` | `#F1EADF` | 17.57:1 | High-emphasis accent, the slash, selected states. |

Constraint discovered during planning: the old cyan `#00F5FF` sat at 15.5:1, so a naive find-and-replace to the new blue would break text readability.
Every text-level usage must map to `brand-blue-light` or `brand-cream`, while fills and glows map to the deeper blues.
Glow effects change from `rgba(0,245,255,…)` to `rgba(60,122,206,…)`; expect glows to read softer and warmer, which suits the more premium, less "neon" direction.

## Phase 1 - Asset production (issue #20)

The provided file is a 3D mockup render (shadows, wall texture), not a production asset.
Rebuild the mark as clean vectors:

1. `frontend/src/assets/logo/` (or inline SVG): mark-only, mark + wordmark horizontal lockup, mark + wordmark stacked.
2. Variants: full color on dark, monochrome cream, monochrome black (for light backgrounds later).
3. `frontend/public/favicon.svg`: mark-only, no background rect (transparent), plus `favicon-32.png` fallback and `apple-touch-icon.png` (180x180).
4. `frontend/public/logo512.png` (512x512, mark on black): becomes the JSON-LD `logo` target, fixing the dead `logo.png` reference from issue #13.
5. Regenerate `frontend/public/og-banner.png` (1200x630) with the new lockup; bump the `?v=` cache-buster in `index.html`.

## Phase 2 - Logo swap in the app (issue #20)

1. Rewrite the `SoftogramLogo` component (`frontend/src/App.js:88-159`) with the new mark as inline SVG.
Keep the existing API (`size`, `showTagline`), the `data-testid` hooks, and a subtle glow (recolored).
The old animated core dot can go; if we keep an animation, a slow shimmer on the slash is on-brand and subtler.
2. Wordmark span: "Softo" white + gradient "gram" becomes the new treatment; recommend all-white "SOFTOGRAM"-style weight with the mark carrying the color, or cream highlight on "gram".
3. Touchpoints: navbar (`App.js:274