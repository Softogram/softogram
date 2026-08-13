import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll visibility flag (issue #82).
 *
 * Deliberately a synchronous geometry check on scroll/resize rather than an
 * IntersectionObserver. The observer version left content stuck at opacity 0:
 * its callbacks are delivered asynchronously, and while the page was still
 * growing from lazy-loading images a fast scroll could land on a section whose
 * callback never arrived, so the section stayed invisible indefinitely. Reading
 * `getBoundingClientRect()` inside a rAF-throttled scroll handler cannot miss an
 * update that way, and it is checked once on mount so anything already on screen
 * is visible on the first paint.
 *
 * `PRE_TRIGGER` starts the fade before the element reaches the viewport, so a
 * normal-speed scroll never catches a section mid-fade.
 *
 * Under `prefers-reduced-motion` the hook reports visible immediately and never
 * listens for anything. Callers that use this to lazily *fetch* rather than to
 * animate should pass `revealWhenReducedMotion: false`: reduced motion says
 * nothing about whether a below-the-fold request should be pulled forward, and
 * `BlogTeaser` depends on staying off the hero's critical path to hold the
 * Lighthouse LCP budget.
 *
 * `visible` latches: once true it stays true and the listeners are removed.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Fraction of viewport height below the fold at which an element starts revealing.
const PRE_TRIGGER = 0.25;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

export function useScrollReveal({ revealWhenReducedMotion = true } = {}) {
  const ref = useRef(null);
  // Seed from the media query so reduced-motion users never see the hidden state,
  // not even for the single frame before the effect runs.
  const [visible, setVisible] = useState(
    () => revealWhenReducedMotion && prefersReducedMotion()
  );

  useEffect(() => {
    if (visible) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    let frame = 0;
    let done = false;

    const isNearViewport = () => {
      const r = el.getBoundingClientRect();
      // Zero-sized elements are not laid out yet; wait rather than reveal blindly.
      if (r.width === 0 && r.height === 0) return false;
      return r.top < window.innerHeight * (1 + PRE_TRIGGER) && r.bottom > 0;
    };

    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };

    const check = () => {
      if (done) return;
      if (isNearViewport()) {
        done = true;
        cleanup();
        setVisible(true);
      }
    };

    function onScroll() {
      if (frame) return; // already scheduled for this frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        check();
      });
    }

    check();
    if (done) return undefined;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return cleanup;
  }, [visible]);

  return { ref, visible };
}
