/**
 * Lightweight per-route SEO head (Phase 8).
 * Updates document.title + primary meta description without a Helmet dependency.
 */
import { useEffect } from "react";

export default function SeoHead({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
}
