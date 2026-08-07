# Blog OG crawler worker (issue #41)

Softogram's marketing site is a CRA SPA. Link-preview bots (WhatsApp, LinkedIn, X) do not run JavaScript, so they see the generic homepage meta tags from `index.html` instead of the post's title/image.

This Worker:

1. Detects known crawler user agents on `/blog/:slug`
2. Fetches pre-rendered OG HTML from `GET {API_ORIGIN}/api/content/blog/{slug}/share.html`
3. Returns that HTML to the crawler
4. Proxies `/rss.xml` to the FastAPI RSS feed (issue #45)
5. Passes every other request through to `SITE_ORIGIN` (the SPA)

## Deploy (human)

```bash
cd workers/blog-og
npx wrangler login
npx wrangler deploy
```

Then attach a route for `softogram.in/*` (and `www` if used) in the Cloudflare dashboard.
If the site stays on CloudFront without Cloudflare DNS, port the same UA + fetch logic to Lambda@Edge / CloudFront Functions + origin request, pointed at the same `/share.html` API.

## Verify

```bash
curl -sA "WhatsApp/2.0" "https://softogram.in/blog/how-we-built-polluxkart" | grep og:title
# Expect the post title, not the homepage title.
```

Also re-check with Facebook Sharing Debugger / X Card Validator after deploy.
