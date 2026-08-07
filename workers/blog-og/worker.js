/**
 * Cloudflare Worker: serve crawler-friendly OG HTML for /blog/:slug (issue #41)
 * and proxy /rss.xml to the FastAPI RSS feed (issue #45).
 *
 * Bindings (wrangler.toml vars):
 *   API_ORIGIN  - e.g. https://api.softogram.in
 *   SITE_ORIGIN - e.g. https://softogram.in (SPA / S3 origin)
 *
 * Deploy (human ops): wrangler deploy from this directory after setting account/zone routes
 * for softogram.in/* (or attach as CloudFront Lambda@Edge with the same logic).
 */

const CRAWLER_UA =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Googlebot|Bingbot|Discordbot|TelegramBot|redditbot|Applebot/i;

export default {
  async fetch(request, env) {
    const apiOrigin = (env.API_ORIGIN || "https://api.softogram.in").replace(/\/$/, "");
    const siteOrigin = (env.SITE_ORIGIN || "https://softogram.in").replace(/\/$/, "");
    const url = new URL(request.url);

    if (url.pathname === "/rss.xml") {
      return fetch(`${apiOrigin}/api/content/blog/rss.xml`, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
      });
    }

    const match = url.pathname.match(/^\/blog\/([^/]+)\/?$/);
    const ua = request.headers.get("user-agent") || "";
    if (match && CRAWLER_UA.test(ua)) {
      const slug = decodeURIComponent(match[1]);
      const og = await fetch(`${apiOrigin}/api/content/blog/${encodeURIComponent(slug)}/share.html`, {
        headers: { Accept: "text/html" },
      });
      if (og.ok) {
        const html = await og.text();
        return new Response(html, {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      }
      // Fall through to SPA on 404 so unknown slugs still get the client 404 page.
    }

    // Pass-through to the SPA origin (S3 / CloudFront).
    const originUrl = new URL(url.pathname + url.search, siteOrigin);
    return fetch(originUrl, request);
  },
};
