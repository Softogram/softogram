# How to verify the Softogram redesign (current state)

## Run the site locally

```bash
cd frontend
yarn install   # once
BROWSER=none PORT=3000 yarn start
```

Open **http://localhost:3000**

Backend is not required for visual chrome checks. Contact API wiring is not part of what's live yet (Phase 4).

Optional (full contact E2E later):

```bash
cd e2e && npm test
```

---

## What is live right now (Phases 0–1 on `main`)

| What | Where to look | Expected |
|---|---|---|
| Green redesign **nav** (`</>` logo, branch dropdown, mono links) | Any page top bar | Green mark + “get in touch”; not the old cyan glass navbar |
| Redesign **footer** (logo PNG + mono links) | Bottom of any page | Dark GitHub-dark footer |
| Home content | `/` | Redesign **Hero** (“We build software that actually ships”) + claim blocks + Contact form; mid sections show Phase 3/4 “pending” placeholders |
| Products scaffold | `/products` | Placeholder “Products” page |
| Client work scaffold | `/client-work` | Placeholder “Client Work” page |
| Case-studies redirect | `/case-studies` | Redirects to `/client-work` |
| Blog | `/blog` | Old blog page under new chrome |
| Policies | `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/cookie-policy` | Legal copy under new chrome |
| Branded 404 | `/definitely-not-a-page` | “404 / wrong repo” + nav + footer |

### Visual brand tokens (Phase 0)

- Accent green `#4ADE80`, amber `#FB923C`, surfaces `#0d1117` / `#09090e`
- Fonts: Fraunces / Outfit / JetBrains Mono loaded (nav/footer use mono; old home sections may still use Space Grotesk)

---

## Phase status

- **Done on screen:** Phases 0–3 (tokens, Layout, Hero/Contact, **Terminal + Build Log**).
- Contact submit is still a UI stub until Phase 4. Shipped / Services are still placeholders.

---

## Quick click path (5 minutes)

1. http://localhost:3000 — new nav over old home  
2. Click **shipped** → `/products` placeholder  
3. Click **clients** → `/client-work` placeholder  
4. Click **blog** → blog list  
5. Open http://localhost:3000/definitely-not-a-page — branded 404  
6. Scroll footer — redesigned chrome  

If anything looks wrong, note the URL + screenshot before we continue Phase 2.
