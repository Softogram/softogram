/**
 * Per-route SEO: title, description, OG/Twitter tags, optional JSON-LD (issues #13/#17).
 */
import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function SeoHead({
  title,
  description,
  canonical,
  image = "https://softogram.in/og-banner.png",
  type = "website",
  jsonLd,
  rssUrl,
  robots,
}) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) upsertMeta("name", "description", description);

    // Only pages that opt in get a robots directive (the 404, issue #79). The tag
    // is removed rather than left behind when navigating to a normal page, since
    // this SPA mutates one shared <head> across every route - a stale
    // "noindex" would otherwise follow the user onto real content.
    const robotsEl = document.querySelector('meta[name="robots"]');
    if (robots) {
      upsertMeta("name", "robots", robots);
    } else if (robotsEl) {
      robotsEl.remove();
    }

    const url = canonical || (typeof window !== "undefined" ? window.location.href : "");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    let rss = document.getElementById("softogram-rss");
    if (rssUrl) {
      if (!rss) {
        rss = document.createElement("link");
        rss.id = "softogram-rss";
        rss.setAttribute("rel", "alternate");
        rss.setAttribute("type", "application/rss+xml");
        rss.setAttribute("title", "Softogram Blog");
        document.head.appendChild(rss);
      }
      rss.setAttribute("href", rssUrl);
    } else if (rss) {
      rss.remove();
    }

    let script = document.getElementById("softogram-jsonld");
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = "softogram-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, image, type, jsonLd, rssUrl, robots]);

  return null;
}
