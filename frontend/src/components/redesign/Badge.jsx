/**
 * Confidence-tier badge — Confirmed (green) / Reported (amber).
 * Ported from Redesign-Softogram-Website (Phase 0).
 */
import React from "react";

const cfg = {
  confirmed: {
    label: "Confirmed",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.25)",
  },
  reported: {
    label: "Reported",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.22)",
  },
};

export default function Badge({ tier, href, className = "" }) {
  const { label, color, bg, border } = cfg[tier] || cfg.reported;
  const inner = (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium select-none ${className}`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.02em",
        transition: "opacity 0.15s",
      }}
      data-testid={`badge-${tier}`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      {label}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center"
        title="View source"
        data-testid={`badge-link-${tier}`}
      >
        {inner}
        <span className="ml-1 text-xs" style={{ color, opacity: 0.6 }}>
          ↗
        </span>
      </a>
    );
  }

  return inner;
}
