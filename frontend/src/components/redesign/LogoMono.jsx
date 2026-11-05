/**
 * Softogram S-mark for the dark nav and footer.
 *
 * Two striped chevrons and a tall slash. The lower chevron is the upper one
 * turned 180 degrees about the centre, which is what makes the mark read as
 * an S. Geometry was measured from the reference artwork (2026-11-04): the
 * slash leans 19 degrees and is 11.3 units wide on the 100-unit box, the
 * chevron band is one slash width thick, the stripes are 0.41 of a slash
 * width with 0.33 gaps, and the tip radius is 0.46.
 *
 * `color` paints the chevrons (site green by default); `slashColor` paints the
 * slash in the site's light text colour, as the reference does, so the two
 * parts stay legible at nav size. Optional animated glow via `glow`.
 */
import React from "react";

// Upper chevron, drawn with two stripe cut-outs (evenodd fill).
const CHEVRON =
  "M 6.83 19.14 L 51.33 12.89 L 37.38 53.07 L 4.43 28.47 A 5.2 5.2 0 0 1 6.83 19.14 Z " +
  "M 13.59 29.5 L 18.88 28.75 L 40.28 44.73 L 39.0 48.48 Z " +
  "M 25.39 27.81 L 47.21 24.76 L 41.93 40.16 Z";

export default function LogoMono({
  size = 28,
  color = "#4ade80",
  slashColor = "#e2e8f0",
  glow = true,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${glow ? "rd-logo-glow" : ""} ${className}`.trim()}
      aria-label="Softogram"
      data-testid="site-logo"
    >
      <path d={CHEVRON} fill={color} fillRule="evenodd" />
      <path
        d={CHEVRON}
        fill={color}
        fillRule="evenodd"
        transform="rotate(180 50 50)"
      />
      {/* Thin dark outline under the slash, as in the reference artwork. */}
      <line
        x1="63.8"
        y1="10.2"
        x2="36.2"
        y2="89.8"
        stroke="#09090e"
        strokeWidth="12.3"
        strokeLinecap="round"
      />
      <line
        x1="63.8"
        y1="10.2"
        x2="36.2"
        y2="89.8"
        stroke={slashColor}
        strokeWidth="11.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
