/**
 * Per-route SEO metadata, shared between React and the build-time prerender
 * (issue #80).
 *
 * `scripts/prerender.js` stamps these exact strings into a per-route index.html
 * so a non-JS crawler sees the right title, description and canonical. Pages
 * read the same values through `metaFor()`, so the raw HTML and the state React
 * applies on mount cannot disagree. Hardcoding the strings in a page again would
 * silently reintroduce the drift this exists to prevent.
 */
import routeMeta from "@/data/routeMeta.json";

export const SITE_ORIGIN = "https://softogram.in";

/**
 * SeoHead props for a static route.
 *
 * Throws on an unknown route rather than falling back: a typo should fail the
 * build's test run, not quietly ship a page inheriting the homepage's canonical,
 * which is the exact bug #80 describes.
 */
export function metaFor(route) {
  const meta = routeMeta.routes[route];
  if (!meta) {
    throw new Error(
      `No routeMeta entry for "${route}". Add it to src/data/routeMeta.json so the prerendered HTML matches.`
    );
  }
  return {
    title: meta.title,
    description: meta.description,
    canonical: `${SITE_ORIGIN}${route}`,
  };
}
