/**
 * Upsolve mark: three chevrons climbing, the lower two in darker solid greens
 * so the fade reads the same on any background. Upsolve is Softogram's live
 * DSA coaching batch, so this mark appears only on /upsolve; the site chrome
 * keeps the Softogram S-mark. Source artwork: softogram-upsolve/brand/upsolve-mark.svg.
 */
import React from "react";

const CHEVRON = (y) => `M 22 ${y} L 50 ${y - 24} L 78 ${y}`;

export default function UpsolveMark({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Upsolve"
      data-testid="upsolve-mark"
    >
      {[
        [88, "#205436"],
        [62, "#379e5e"],
        [36, "#fb923c"],
      ].map(([y, color]) => (
        <path key={y} d={CHEVRON(y)} stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
