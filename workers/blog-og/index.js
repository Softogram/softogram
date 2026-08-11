/**
 * Lambda@Edge (origin-request): serve crawler-friendly OG HTML for /blog/:slug
 * and proxy /rss.xml to the FastAPI RSS feed. Port of workers/blog-og/worker.js
 * (issue #41) for CloudFront, since the site is on CloudFront, not Cloudflare
 * DNS (issue #74).
 *
 * Lambda@Edge does not support environment variables, so API_ORIGIN is
 * hardcoded here rather than read from config.
 */
const API_ORIGIN = "https://api.softogram.in";

const CRAWLER_UA =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Googlebot|Bingbot|Discordbot|TelegramBot|redditbot|Applebot/i;

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uaHeader = request.headers["user-agent"];
  const ua = (uaHeader && uaHeader[0] && uaHeader[0].value) || "";

  if (request.uri === "/rss.xml") {
    try {
      const res = await fetch(`${API_ORIGIN}/api/content/blog/rss.xml`, {
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
      // Fetch failed - fall through to normal origin behavior below.
    }
    return request;
  }

  const match = request.uri.match(/^\/blog\/([^/]+)\/?$/);
  if (match && CRAWLER_UA.test(ua)) {
    const slug = decodeURIComponent(match[1]);
    try {
      const res = await fetch(`${API_ORIGIN}/api/content/blog/${encodeURIComponent(slug)}/share.html`, {
        headers: { Accept: "text/html" },
      });
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
      // Fetch failed - fall through to normal origin behavior below.
    }
  }

  return request;
};
