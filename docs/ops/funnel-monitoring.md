# Funnel instrumentation + uptime (issue #15)

## Done in code
- Consent banner gates PostHog init (`ConsentBanner` + `lib/analytics.js`)
- Events: `contact_form_viewed`, `contact_form_submitted`, `contact_form_failed`,
  `whatsapp_clicked`, `booking_clicked`
- Session recording only starts after **accept**

## Configure
```
# frontend/.env
REACT_APP_POSTHOG_KEY=phc_xxx
REACT_APP_POSTHOG_HOST=https://us.i.posthog.com
```

## Your ops checklist
1. Create PostHog project → paste key into production frontend env → redeploy.
2. Build funnel: pageview → `contact_form_viewed` → `contact_form_submitted`.
3. Google Search Console: verify `softogram.in`, submit `https://softogram.in/sitemap.xml`.
4. UptimeRobot / BetterStack monitors:
   - `https://softogram.in/` (HTTP 200)
   - `https://api.softogram.in/api/` (HTTP 200)
   - Enable **SSL certificate expiry** alerts to email/WhatsApp
5. Trigger a test downtime alert once and confirm delivery.
