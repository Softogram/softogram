import React from "react";
import { Link } from "react-router-dom";

const DIM = "#8b949e";
const G = "#4ade80";

/** Temporary landing for routes that land in later redesign phases. */
export default function PlaceholderPage({ title, note }) {
  return (
    <div
      className="min-h-screen px-6"
      style={{ paddingTop: 120, background: "#0d1117", color: "#e2e8f0" }}
      data-testid="placeholder-page"
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-xs mb-3" style={{ color: G, fontFamily: "var(--font-mono)" }}>
          softogram · redesign
        </p>
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid="placeholder-title"
        >
          {title}
        </h1>
        <p className="text-sm mb-8" style={{ color: DIM, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {note ||
            "This route is scaffolded in Phase 1. Content arrives in a later redesign phase."}
        </p>
        <Link to="/" className="text-sm" style={{ color: G, fontFamily: "var(--font-mono)" }}>
          ← Back home
        </Link>
      </div>
    </div>
  );
}
