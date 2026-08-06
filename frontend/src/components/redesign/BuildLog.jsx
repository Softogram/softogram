import React, { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "./Badge";
import { G, A, DIM, BORDER, GutterRow, Section } from "./homePrimitives";

export const BUILD_LOG = [
  {
    date: "2026-08-05",
    week: "week-2",
    status: "confirmed",
    title: "v0.1.1 — Linux glibc mismatch patched, same day",
    detail:
      "v0.1.0 Linux binary broke on glibc < 2.28. Caught before wide distribution. Rebuilt against glibc 2.17 compat target. Tagged v0.1.1 within hours of discovery.",
    ref: "https://github.com/Softogram/softogram-mcp-spec-migration-checker/releases/tag/v0.1.1",
  },
  {
    date: "2026-08-03",
    week: "week-2",
    status: "reported",
    title: "search-to-md — Tavily rate-limit retry not yet shipped",
    detail:
      "Go client silently drops results above free-tier limit instead of queuing. Documented. Retry-with-backoff scoped but not merged.",
  },
  {
    date: "2026-08-01",
    week: "week-2",
    status: "confirmed",
    title: "mcp-migration-checker v0.1.0 shipped",
    detail:
      "Go binary, cross-platform (macOS arm64/amd64, Linux amd64, Windows amd64). VHS-generated demo.gif in repo. Confidence-tiered output: CONFIRMED / REPORTED with file:line refs.",
    ref: "https://github.com/Softogram/softogram-mcp-spec-migration-checker/releases/tag/v0.1.0",
  },
  {
    date: "2026-07-28",
    week: "week-2",
    status: "confirmed",
    title: "search-to-md — Go rewrite started, Tavily wired",
    detail:
      "Python prototype was too slow for batch runs. Go rewrite: Tavily API wired, Markdown output working for single queries. Batch dedup not yet done.",
  },
  {
    date: "2026-07-21",
    week: "week-1",
    status: "confirmed",
    title: "search-to-md — Python prototype complete",
    detail:
      "Single-query: Tavily search → structured Markdown. Gaps identified: batch mode, dedup, rate-limit handling. Scope defined for Go rewrite.",
  },
  {
    date: "2026-07-14",
    week: "pre",
    status: "reported",
    title: "mcp-spec tooling — gap identified, scope written",
    detail:
      "No tooling existed to audit MCP server implementations against spec changes. Defined checker approach: file-pair diffing, rule engine, tiered output. Build started.",
  },
  {
    date: "2026-07-10",
    week: "pre",
    status: "reported",
    title: "softogram site redesign — Figma Make prototype started",
    detail:
      "Explored Vite + TS redesign shell. Port path decided later: CRA keep, JSX only, green/amber tokens.",
  },
  {
    date: "2026-07-02",
    week: "pre",
    status: "confirmed",
    title: "org decision — ship public tools before services narrative",
    detail:
      "Prefer runnable binaries and changelogs over brochure copy. Terminal demos and build log become homepage proof.",
  },
];

function BuildLogRow({ entry, lineNum }) {
  const [open, setOpen] = useState(false);
  const accentColor = entry.status === "confirmed" ? G : A;
  const marker = entry.status === "confirmed" ? "+" : " ";

  return (
    <GutterRow lineNum={lineNum} marker={marker}>
      <div
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
        data-testid="build-log-row"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-mono)", color: DIM }}>
            {entry.date}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-sm shrink-0"
            style={{
              background: `${accentColor}14`,
              color: accentColor,
              border: `1px solid ${accentColor}28`,
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
            }}
          >
            {entry.week}
          </span>
          <span
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <Badge tier={entry.status} href={entry.ref} />
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "#e2e8f0" }}
            data-testid="build-log-title"
          >
            {entry.title}
          </span>
          <span
            className="ml-auto text-xs"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}
          >
            {open ? "▲" : "▼"}
          </span>
        </div>
        {open && (
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{
              color: DIM,
              maxWidth: "68ch",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
            }}
            data-testid="build-log-detail"
          >
            {entry.detail}
          </p>
        )}
      </div>
    </GutterRow>
  );
}

/**
 * Build log: fixed header + vertically scrollable rows (same section).
 * Header stays pinned inside the section; only the log list scrolls.
 */
export default function BuildLogSection({ lineStart = 20 }) {
  let ln = lineStart;

  const take = () => {
    const current = ln;
    ln += 1;
    return current;
  };

  return (
    <Section id="build-log" topRule bg="#0d1117" testId="build-log-section">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col" style={{ maxHeight: 720 }}>
        {/* Fixed header — does not scroll with the logs */}
        <div
          className="shrink-0 pb-4 mb-1"
          style={{ borderBottom: `1px solid ${BORDER}`, background: "#0d1117" }}
          data-testid="build-log-header"
        >
          <GutterRow lineNum={take()}>
            <div>
              <div className="text-xs mb-1" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                # git log --oneline --all
              </div>
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <h2
                  className="leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    color: "#e2e8f0",
                  }}
                >
                  What shipped,{" "}
                  <span className="italic" style={{ color: G }}>
                    and what didn&apos;t — yet.
                  </span>
                </h2>
                <span className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                  includes failures · click to expand · scroll ↓
                </span>
              </div>
            </div>
          </GutterRow>
        </div>

        {/* Vertically scrollable log rows */}
        <div className="relative min-h-0 flex-1">
          <div
            className="pane-scroll"
            style={{ height: 320, overflowY: "auto", overflowX: "hidden" }}
            data-testid="build-log-scroll"
          >
            <div className="py-2">
              <div id="week-2" />
              {BUILD_LOG.filter((e) => e.week === "week-2").map((entry, i) => (
                <BuildLogRow key={`w2-${i}`} entry={entry} lineNum={take()} />
              ))}

              <GutterRow lineNum={take()} dimmed>
                <div
                  className="py-1 text-xs"
                  style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}
                >
                  ── week-1 ──────────────────────────────────
                </div>
              </GutterRow>

              <div id="week-1" />
              {BUILD_LOG.filter((e) => e.week === "week-1").map((entry, i) => (
                <BuildLogRow key={`w1-${i}`} entry={entry} lineNum={take()} />
              ))}

              <GutterRow lineNum={take()} dimmed>
                <div
                  className="py-1 text-xs"
                  style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}
                >
                  ── pre-project ─────────────────────────────
                </div>
              </GutterRow>

              {BUILD_LOG.filter((e) => e.week === "pre").map((entry, i) => (
                <BuildLogRow key={`pre-${i}`} entry={entry} lineNum={take()} />
              ))}

              <GutterRow lineNum={take()}>
                <div className="pt-3 pb-6">
                  <Link
                    to="/blog"
                    className="text-xs transition-colors duration-150"
                    style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = G;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = DIM;
                    }}
                  >
                    → full engineering notes in blog
                  </Link>
                </div>
              </GutterRow>
            </div>
          </div>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-14"
            style={{ background: "linear-gradient(to top, #0d1117, transparent)" }}
          />
        </div>
      </div>
    </Section>
  );
}
