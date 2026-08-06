/**
 * Diff-style claim: struck generic line → honest replacement.
 * Ported from Redesign-Softogram-Website (Phase 0).
 */
import React from "react";
import Badge from "./Badge";

export default function ClaimBlock({
  old: oldClaim,
  replacement,
  badge,
  badgeHref,
  className = "",
}) {
  return (
    <div
      className={`rounded-sm overflow-hidden ${className}`}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.78rem",
        lineHeight: 1.6,
      }}
      data-testid="claim-block"
    >
      <div
        className="flex items-start gap-3 px-3 py-1.5"
        style={{
          background: "rgba(248,113,113,0.07)",
          borderLeft: "3px solid rgba(248,113,113,0.45)",
        }}
      >
        <span
          className="shrink-0 select-none font-bold"
          style={{ color: "rgba(248,113,113,0.55)", marginTop: 1 }}
        >
          -
        </span>
        <span
          style={{
            color: "#94a3b8",
            textDecoration: "line-through",
            textDecorationColor: "rgba(248,113,113,0.4)",
          }}
        >
          {oldClaim}
        </span>
      </div>
      <div
        className="flex items-start gap-3 px-3 py-1.5"
        style={{
          background: "rgba(74,222,128,0.07)",
          borderLeft: "3px solid rgba(74,222,128,0.4)",
        }}
      >
        <span
          className="shrink-0 select-none font-bold"
          style={{ color: "#4ade80", marginTop: 1 }}
        >
          +
        </span>
        <span
          className="flex-1"
          style={{
            color: "#e2e8f0",
            fontFamily:
              badge === "confirmed" ? "var(--font-display)" : "var(--font-mono)",
            fontStyle: badge === "confirmed" ? "italic" : "normal",
            fontSize: badge === "confirmed" ? "0.85rem" : "0.78rem",
          }}
        >
          {replacement}
        </span>
        {badge && (
          <span className="shrink-0 self-center ml-2">
            <Badge tier={badge} href={badgeHref} />
          </span>
        )}
      </div>
    </div>
  );
}
