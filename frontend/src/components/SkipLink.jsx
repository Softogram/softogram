/**
 * Skip-to-content link (issue #93).
 *
 * Lives in App.js above ConsentBanner and LeadMagnet rather than inside Layout,
 * because a skip link only works if it is the *first* focusable element in the
 * document. Layout renders inside <Routes>, which comes after the consent banner
 * and the floating checklist button - so a skip link placed there meant the first
 * Tab landed on a marketing button instead of on the way past the navigation.
 * That is the exact problem the link exists to solve, and an e2e test asserts the
 * ordering so it cannot silently regress.
 *
 * Hidden until focused via Tailwind's sr-only / focus:not-sr-only pair, so it
 * costs nothing visually for pointer users.
 */
export default function SkipLink() {
  return (
    <a
      href="#main"
      data-testid="skip-link"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[2000] focus:px-4 focus:py-2 focus:rounded-sm"
      style={{
        background: "#4ade80",
        color: "#0d1117",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.75rem",
      }}
    >
      Skip to content
    </a>
  );
}
