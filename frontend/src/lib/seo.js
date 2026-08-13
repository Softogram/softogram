/**
 * Structured-data helpers (issue #79).
 *
 * BreadcrumbList is what lets Google render a breadcrumb trail under a search
 * result instead of a bare URL. Before this, only the homepage and individual
 * blog posts carried any JSON-LD at all.
 *
 * `SeoHead` serialises whatever it is handed into a single <script> tag, and a
 * top-level array is valid JSON-LD, so a page can pass
 * `jsonLd={[breadcrumbLd(...), articleLd]}` without any change to how the tag is
 * written.
 */

export const SITE_ORIGIN = "https://softogram.in";

/**
 * Build a BreadcrumbList from an ordered trail.
 *
 * Pass paths, not full URLs: `[{ name: "Blog", path: "/blog" }]`. "Home" is
 * prepended automatically so every trail is rooted consistently. The final crumb
 * is the current page and should still carry its own path, since Google expects
 * every item to have an identifier.
 */
export function breadcrumbLd(trail) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };
}
