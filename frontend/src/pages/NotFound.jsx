import React from "react";
import { Link } from "react-router-dom";

const G = "#4ade80";
const DIM = "#8b949e";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ paddingTop: 80, background: "#0d1117", color: "#e2e8f0" }}
      data-testid="not-found-page"
    >
      <div
        className="text-6xl font-bold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "#333350" }}
      >
        404
      </div>
      <p className="mb-2 text-sm" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
        This page shipped to the wrong repo.
      </p>
      <p className="mb-8 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}>
        The route you requested does not exist.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="px-4 py-2 rounded-sm text-xs font-semibold"
          style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
          data-testid="not-found-home"
        >
          ← Back home
        </Link>
        <a
          href="/#contact"
          className="px-4 py-2 rounded-sm text-xs font-semibold"
          style={{
            border: `1px solid ${G}`,
            color: G,
            fontFamily: "var(--font-mono)",
          }}
          data-testid="not-found-contact"
        >
          Contact
        </a>
      </div>
    </div>
  );
}
