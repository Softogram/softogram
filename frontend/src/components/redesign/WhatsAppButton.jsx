/**
 * Floating WhatsApp CTA — full international number (issue #12).
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { WHATSAPP_HREF } from "@/data/site";
import { WHATSAPP_DEMO_HREF } from "@/data/upsolve";
import { capture } from "@/lib/analytics";

// Anything a finger might be aiming for when the bubble floats over it.
const TAPPABLE = "a, button, input, select, textarea, label, summary, [role='button']";
// The centre and four sides of the round bubble, as fractions of its box.
const SPOTS = [[0.5, 0.5], [0.12, 0.5], [0.88, 0.5], [0.5, 0.12], [0.5, 0.88]];

/**
 * True while something tappable is underneath the bubble on a phone.
 *
 * Buttons there run the full width of the screen, so they pass under the bubble as
 * the page scrolls, and a tap on the end of "Book my demo seat" opened WhatsApp
 * instead of booking. Desktop has margins, so it never steps aside.
 */
function useStepAside(ref) {
  const [away, setAway] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 1023px)");
    let timer = 0;
    const check = () => {
      timer = 0;
      const bubble = ref.current;
      if (!bubble) return;
      if (!phone.matches) {
        setAway(false);
        return;
      }
      const box = bubble.getBoundingClientRect();
      setAway(
        SPOTS.some(([x, y]) =>
          document
            .elementsFromPoint(box.left + box.width * x, box.top + box.height * y)
            .some((el) => !bubble.contains(el) && el.closest(TAPPABLE)),
        ),
      );
    };
    // Scroll fires constantly, so look at most about twelve times a second.
    const schedule = () => {
      if (!timer) timer = window.setTimeout(check, 80);
    };
    // Layout also moves without a scroll: live numbers arriving, the form being replaced.
    const layout = new ResizeObserver(schedule);
    layout.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.clearTimeout(timer);
      layout.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, pathname]);

  return away;
}

export default function WhatsAppButton({ hidden = false }) {
  // Students on the Upsolve pages are not asking about a software project.
  const { pathname } = useLocation();
  const bubble = useRef(null);
  const away = useStepAside(bubble) || hidden;
  return (
    <a
      ref={bubble}
      href={pathname.startsWith("/upsolve") ? WHATSAPP_DEMO_HREF : WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-btn${away ? " whatsapp-btn--away" : ""}`}
      tabIndex={away ? -1 : undefined}
      aria-hidden={away || undefined}
      data-testid="whatsapp-button"
      aria-label="Chat on WhatsApp"
      onClick={() => capture("whatsapp_clicked")}
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}
