/**
 * Mono Softogram mark (</> brackets + slash) for dark nav.
 * Ported from Redesign-Softogram-Website (Phase 0).
 * Optional animated glow via `glow` prop (keeps owner decision from logo plan).
 */
import React from "react";

export default function LogoMono({
  size = 28,
  color = "#4ade80",
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
      <polyline
        points="34,20 12,50 34,80"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="66,20 88,50 66,80"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="66"
        y1="20"
        x2="34"
        y2="80"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
