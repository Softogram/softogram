/**
 * Lambda@Edge (viewer-request): serve crawler-friendly OG HTML for /blog/:slug
 * and proxy /rss.xml to the FastAPI RSS feed. Port of workers/blog-og/worker.js
 * (issue #41) for CloudFront, since the site is on CloudFront, not Cloudflare
 * DNS (issue #74).
 *
 * Must be viewer-request, not origin-request: origin-request only sees the
 * headers CloudFront's origin request policy would forward to the origin,
 * which excludes User-Agent by default - it arrives as the literal string
 * "Amazon CloudFront" instead of the real client UA. viewer-request sees the
 * actual request as the client sent it, before any policy filtering.
 *
 * viewer-request has a hard 5s execution ceiling (vs 30s for origin-request),
 * so the API fetch is bounded well under that - a slow/hanging backend should
 * never risk the Lambda timing out.
 *
 * Lambda@Edge does not support environment variables, so API_ORIGIN is
 * hardcoded here rather than read from config.
 */
const API_ORIGIN = "https://api.softogram.in";
const FETCH_TIMEOUT_MS = 3500;

// Must stay in sync with frontend/src/data/routeMeta.json, which is what
// scripts/prerender.js actually writes files for. "/" is excluded: it already
// resolves to the bucket's root index.html, which the prerender step overwrites
// in place. A route listed here without a corresponding prerendered file would
// 404 into the SPA fallback - the current behaviour, so the failure is soft.
const PRERENDERED_ROUTES = new Set([
  "/products",
  "/client-work",
  "/blog",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/cookie-policy",
]);

const CRAWLER_UA =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Googlebot|Bingbot|Discordbot|TelegramBot|redditbot|Applebot/i;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uaHeader = request.headers["user-agent"];
  const ua = (uaHeader && uaHeader[0] && uaHeader[0].value) || "";

  if (request.uri === "/rss.xml") {
    try {
      const res = await fetchWithTimeout(`${API_ORIGIN}/api/content/blog/rss.xml`, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
      });
      if (res.ok) {
        const body = await res.text();
        return {
          status: "200",
          statusDescription: "OK",
          headers: {
            "content-type": [{ key: "Content-Type", value: "application/rss+xml; charset=utf-8" }],
          },
          body,
        };
      }
    } catch (e) {
      // Fetch failed or timed out - fall through to normal origin behavior below.
    }
    return request;
  }

  // /sitemap.xml proxied to the CMS-generated sitemap (issue #78). Same shape as
  // /rss.xml above. Crawlers reject a sitemap served from a different host than
  // the URLs it lists, so this cannot simply live on api.softogram.in - it has to
  // appear at the apex. On any failure it falls through and CloudFront serves the
  // static frontend/public/sitemap.xml, which stays in place as the fallback.
  if (request.uri === "/sitemap.xml") {
    try {
      const res = await fetchWithTimeout(`${API_ORIGIN}/api/content/sitemap.xml`, {
        headers: { Accept: "application/xml, text/xml, */*" },
      });
      if (res.ok) {
        const body = await res.text();
        return {
          status: "200",
          statusDescription: "OK",
          headers: {
            "content-type": [{ key: "Content-Type", value: "application/xml; charset=utf-8" }],
          },
          body,
        };
      }
    } catch (e) {
      // Fetch failed or timed out - fall through to the static object in S3.
    }
    return request;
  }

  // Prerendered static routes (issue #80). `yarn build` writes a per-route
  // index.html carrying that route's real title, description and canonical, so
  // a client that never runs JavaScript sees correct metadata instead of the
  // homepage's.
  //
  // The rewrite is required because CloudFront's S3 origin does not resolve
  // directory indexes: a request for /products maps to the S3 key "products",
  // which does not exist, and falls through to the custom-error rule that
  // returns the generic index.html. Pointing the URI at the real object is all
  // that is needed - no fetch, no added latency on this path.
  //
  // Unknown routes are untouched and keep the existing SPA fallback behaviour.
  if (PRERENDERED_ROUTES.has(request.uri)) {
    request.uri = `${request.uri}/index.html`;
    return request;
  }

  const match = request.uri.match(/^\/blog\/([^/]+)\/?$/);
  if (match && CRAWLER_UA.test(ua)) {
    const slug = decodeURIComponent(match[1]);
    try {
      const res = await fetchWithTimeout(
        `${API_ORIGIN}/api/content/blog/${encodeURIComponent(slug)}/share.html`,
        { headers: { Accept: "text/html" } },
      );
      if (res.ok) {
        const html = await res.text();
        return {
          status: "200",
          statusDescription: "OK",
          headers: {
            "content-type": [{ key: "Content-Type", value: "text/html; charset=utf-8" }],
          },
          body: html,
        };
      }
    } catch (e) {
      // Fetch failed or timed out - fall through to normal origin behavior below.
    }
  }

  return request;
};
