/**
 * Responsive image URLs for CMS cover images (issue #103).
 *
 * Cover images are hotlinked from images.unsplash.com and stored at a single
 * fixed size - blog covers are requested at w=1200&h=600 regardless of where
 * they render. On /blog the card images display at roughly 400x160, so every
 * card downloaded a 1200px asset to paint a 400px box. Lighthouse measured that
 * page at 0.64 performance with a 4.5s LCP and 0.468 CLS: fast first paint,
 * then a long wait for oversized images that had no reserved space.
 *
 * Unsplash serves resized variants from URL parameters, so the fix is to ask
 * for the size actually needed rather than re-encoding anything ourselves.
 * Non-Unsplash URLs (anything uploaded through /admin) pass through untouched,
 * so this is safe as cover images move off stock photography later.
 */

const UNSPLASH_HOST = "images.unsplash.com";

function isResizable(url) {
  if (typeof url !== "string" || !url) return false;
  try {
    return new URL(url).hostname === UNSPLASH_HOST;
  } catch {
    return false; // relative or malformed - leave it alone
  }
}

/**
 * A URL for this image at roughly `width` CSS pixels.
 * `dpr` requests a denser variant for high-DPI screens without changing layout.
 */
export function sizedImage(url, { width, height, dpr = 1 } = {}) {
  if (!isResizable(url)) return url;
  try {
    const u = new URL(url);
    if (width) u.searchParams.set("w", String(Math.round(width * dpr)));
    if (height) u.searchParams.set("h", String(Math.round(height * dpr)));
    u.searchParams.set("fit", "crop");
    u.searchParams.set("auto", "format"); // lets Unsplash serve webp/avif by Accept
    u.searchParams.set("q", "70");
    return u.toString();
  } catch {
    return url;
  }
}

/** `srcSet` covering 1x and 2x, so retina screens stay sharp without a 3x download. */
export function imageSrcSet(url, { width, height } = {}) {
  if (!isResizable(url) || !width) return undefined;
  return [
    `${sizedImage(url, { width, height, dpr: 1 })} 1x`,
    `${sizedImage(url, { width, height, dpr: 2 })} 2x`,
  ].join(", ");
}

/**
 * Props for a CMS cover image.
 *
 * `width`/`height` are the intrinsic attributes, not a CSS size - they give the
 * browser an aspect ratio to reserve space with before the image arrives, which
 * is what removes the layout shift. Tailwind classes still control the rendered
 * size.
 *
 * Pass `priority` for an above-the-fold image (the featured post). That one
 * should be fetched eagerly and at high priority because it is the LCP element;
 * everything below the fold should stay lazy.
 */
export function coverImageProps(url, { width, height, priority = false } = {}) {
  return {
    src: sizedImage(url, { width, height }),
    srcSet: imageSrcSet(url, { width, height }),
    width,
    height,
    loading: priority ? "eager" : "lazy",
    decoding: priority ? "sync" : "async",
    fetchPriority: priority ? "high" : "auto",
  };
}
