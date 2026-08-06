import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const G = "#4ade80";
export const A = "#fb923c";
export const DIM = "#8b949e";
export const BORDER = "rgba(255,255,255,0.06)";
export const CARD = "#161b22";

export function GutterRow({ children, lineNum, marker, dimmed }) {
  const markerColor = marker === "+" ? G : marker === "-" ? "#f87171" : "transparent";
  const rowBg =
    marker === "+"
      ? "rgba(74,222,128,0.04)"
      : marker === "-"
        ? "rgba(248,113,113,0.04)"
        : "transparent";

  return (
    <div className="flex min-w-0" style={{ background: rowBg, opacity: dimmed ? 0.5 : 1 }}>
      <div
        className="shrink-0 text-right pr-3 select-none"
        style={{
          width: 48,
          borderRight: `1px solid ${BORDER}`,
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "rgba(255,255,255,0.18)",
          paddingTop: 4,
          lineHeight: 1,
        }}
      >
        {lineNum}
      </div>
      {marker !== undefined && (
        <div
          className="shrink-0 w-5 text-center select-none"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: markerColor,
            paddingTop: 2,
          }}
        >
          {marker}
        </div>
      )}
      <div className={`flex-1 min-w-0 ${marker !== undefined ? "pl-3" : "pl-6"} py-2`}>
        {children}
      </div>
    </div>
  );
}

export function Section({ children, id, className = "", bg, topRule, testId }) {
  return (
    <section
      id={id}
      data-testid={testId || (id ? `${id}-section` : undefined)}
      className={`relative overflow-hidden ${className}`}
      style={{ background: bg ?? "#0d1117" }}
    >
      {topRule && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${G}33, transparent)` }}
        />
      )}
      {children}
    </section>
  );
}

export function Reveal({ children, delay = 0 }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
