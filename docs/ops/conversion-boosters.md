# Conversion boosters follow-ups (issue #16)

## Done in code
- Booking CTAs → `REACT_APP_BOOKING_URL` (default `https://cal.com/softogram`)
- Named testimonials on home (`data/testimonials.js`)
- Client/product cards link to live URLs (Polluxkart, GitHub MCP checker, etc.)
- Trust badge links in footer (Clutch / GoodFirms / Google Business)

## Your ops checklist
1. Create the real Cal.com (or Calendly) event and set `REACT_APP_BOOKING_URL`.
2. Confirm permission for named testimonials or replace with approved quotes.
3. Claim/create Clutch + GoodFirms + Google Business Profile; set:
   ```
   REACT_APP_CLUTCH_URL=...
   REACT_APP_GOODFIRMS_URL=...
   REACT_APP_GBP_URL=...
   ```
4. Swap any placeholder portfolio URLs once real case studies are public.
