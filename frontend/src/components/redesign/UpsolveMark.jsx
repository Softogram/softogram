/**
 * Upsolve mark: a U (the bucket of problems you got stuck on) with an arrow
 * rising out of it. Upsolve is Softogram's live DSA coaching batch, so this
 * mark appears only on /upsolve; the site chrome keeps the Softogram S-mark.
 * Source of truth for the artwork is softogram-upsolve/brand/upsolve-mark.svg.
 */
import React from "react";

export default function UpsolveMark({ size = 40, color = "#4ade80", cupColor = "#e2e8f0", className = "" }) {
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
      <path d="M 22 24 V 62 A 28 28 0 0 0 78 62 V 24" stroke={cupColor} strokeWidth="11" strokeLinecap="round" />
      <path d="M 50 76 V 20" stroke={color} strokeWidth="11" strokeLinecap="round" />
      <path
        d="M 31 39 L 50 20 L 69 39"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
