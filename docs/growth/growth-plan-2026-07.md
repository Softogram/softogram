# Softogram Growth and Engagement Plan - July 2026

Goal: make the site more catchy, more engaging, and more discoverable, and measure all of it.
The brand foundation (premium dark glassmorphism, strong tagline) is already good.
The plan focuses on fixing conversion leaks, compounding SEO, adding social proof, and instrumenting the funnel.

## 1. Fix the conversion leaks first (highest ROI, smallest effort)

These are bugs, not features.
Every marketing effort leaks through them today.

- **Contact form is dead** (expired API cert, see security audit SEC-1). Nothing else matters until this is fixed.
- **WhatsApp button is broken for international visitors**: `App.js:1626` links to `wa.me/6393783010`, missing the `91` country code. wa.me requires full international format (`wa.me/916393783010`).
- **JSON-LD placeholders**: `index.html` structured data has `"telephone": "+91-XXXXXXXXXX"`, references `logo.png` and `og-banner.jpg` that do not exist in `frontend/public/` (only `og-banner.png` exists), and `sameAs` lists Twitter/Google pages that may not exist.
- **No lead confirmation email** (see email review EMAIL-4).

## 2. SEO: from one-page meta to compounding organic traffic

Current state: solid start (title/description, OG image, geo tags, JSON-LD, robots.txt, sitemap.xml), but with defects.

- **Deduplicate meta**: `index.html` has the OG and Twitter blocks twice and `keywords` twice. Crawlers tolerate it, but it signals template rot and makes edits error-prone.
- **Per-route meta**: the SPA serves identical title/description for `/blog`, `/case-studies`, and policy pages. Add `react-helmet-async` for per-route title/description/OG, and consider prerendering (react-snap) or SSG for crawlability of non-home routes.
- **Content engine**: the blog routes exist with placeholder content. Publishing 2-4 genuinely useful posts per month (build-vs-buy costs in INR, case study teardowns, "how we built Polluxkart") is the single biggest long-term traffic lever for a services company.
- **Local SEO**: geo meta targets Prayagraj already. Create/claim the Google Business Profile, get listed on Clutch, GoodFirms, and DesignRush (these rank on "software company in X" queries and carry review widgets).
- **Search Console**: register the property, submit the sitemap, monitor coverage.

## 3. Social proof and trust (services companies live on this)

- Replace initial-avatar testimonials with named clients, photos, and company names (with permission), or embed Clutch/Google review widgets.
- Portfolio cards should link to live projects or detailed case studies with real metrics ("cut checkout latency 40%").
- Add a logos strip ("trusted by") and founder-visible content (LinkedIn posts embedded or linked).
- Publish the team page or founder story. Anonymous agencies convert worse.

## 4. Engagement and catchiness on the page

- **Booking friction**: add a Calendly (or Cal.com) "Book a free 30-min consultation" button next to the contact form. Many leads prefer picking a slot over writing a message.
- **Interactive estimate**: a small "project cost estimator" (pick service, size, timeline, get an instant INR range) is catchy, shareable, and pre-qualifies leads. It fits the existing pricing section.
- **Exit-intent lead magnet**: offer a PDF ("Launch checklist: 25 things before your product goes live") for an email address. Feeds a newsletter list.
- **Live chat**: the WhatsApp button already covers chat for the target market once the link is fixed. A full live-chat tool is optional later.
- **Performance is engagement**: the hero pulls in three.js + react-three/drei (~600KB+ of JS) on first paint. Lazy-load the 3D background, code-split routes with `React.lazy`, and set a Lighthouse budget (mobile performance >= 85). Slow first paint kills both bounce rate and Google ranking.

## 5. Measurement (already half-done)

- PostHog is already installed in `index.html`. Add explicit funnel events: `contact_form_viewed`, `contact_form_submitted`, `contact_form_failed`, `whatsapp_clicked`, `pricing_viewed`, `booking_clicked`. Build the funnel dashboard.
- Add **uptime + TLS expiry monitoring** (UptimeRobot free tier or BetterStack) for both `softogram.in` and `api.softogram.in`, alerting to email/WhatsApp. The cert outage went unnoticed for a month; monitoring would have caught it in minutes.
- Google Search Console for organic query data.
- Cookie consent banner before expanding tracking (PostHog session recording is enabled; EU/India privacy posture and the existing cookie policy page should match reality).

## Recommended tool stack (all free tiers where possible)

| Need | Tool | Why |
|---|---|---|
| Analytics + funnels + session replay | PostHog (already installed) | One tool, generous free tier |
| Organic search data | Google Search Console | Free, canonical |
| Uptime + TLS monitoring | UptimeRobot / BetterStack | Would have caught the cert outage |
| Booking | Cal.com or Calendly | Removes contact friction |
| Reviews/listing | Clutch, GoodFirms, Google Business Profile | Ranks for "software company" queries |
| Email deliverability | SendGrid domain auth + DMARC | Already on SendGrid |
| Per-route meta | react-helmet-async | Lightweight, fits CRA |
| Performance guardrail | Lighthouse CI in GitHub Actions | Stops regressions |

## Sequencing

1. Week 1: conversion leak fixes (cert, WhatsApp link, JSON-LD, meta dedupe) plus monitoring.
2. Week 2-3: funnel events, Search Console, booking link, testimonial/portfolio upgrades, performance pass.
3. Ongoing: content engine (blog + case studies), directory listings, lead magnet.
