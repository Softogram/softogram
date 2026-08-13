import React from "react";
import Badge from "./Badge";
import Terminal from "./Terminal";
import { G, A, DIM, GutterRow, Section } from "./homePrimitives";

/** Dummy tool card — placeholder so horizontal scroll is demonstrable. */
function DummyToolCard({ title, subtitle, accent, lines, badge }) {
  return (
    <div
      className="shrink-0"
      style={{ width: 520, maxWidth: "100%" }}
      data-testid="dummy-tool-card"
    >
      <div
        className="rounded-sm overflow-hidden"
        style={{
          background: "#010409",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          lineHeight: 1.7,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "64px 1fr 64px",
            alignItems: "center",
            background: "#161b22",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            height: 36,
            padding: "0 12px",
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div style={{ color: "#8b949e", fontSize: 12, textAlign: "center" }}>{title}</div>
          <div />
        </div>

        <div className="p-4" style={{ minHeight: 220 }}>
          <div className="mb-3 flex items-center gap-2">
            <span style={{ color: accent, fontSize: "0.65rem" }}>{badge}</span>
            <span style={{ color: DIM }}>{subtitle}</span>
          </div>
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.color || DIM }}>
              {line.text}
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: "#161b22", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-xs" style={{ color: "#8b949e" }}>
            dummy preview — scroll horizontally →
          </span>
          <span
            className="px-3 py-1 rounded-sm text-xs font-semibold"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
          >
            soon
          </span>
        </div>
      </div>
    </div>
  );
}

const DUMMY_TOOLS = [
  {
    title: "search-to-md — bash",
    subtitle: "tavily → structured markdown",
    accent: G,
    badge: "[DEMO]",
    lines: [
      { text: "softogram@cli:~$ search-to-md \"mcp schema changes\"", color: "#e2e8f0" },
      { text: "", color: "" },
      { text: "querying tavily …", color: "#94a3b8" },
      { text: "→ 12 hits · writing notes/mcp-schema.md", color: G },
      { text: "exit 0", color: "#94a3b8" },
    ],
  },
  {
    title: "spec-diff — bash",
    subtitle: "mock — before/after protocol delta",
    accent: A,
    badge: "[STUB]",
    lines: [
      { text: "softogram@cli:~$ spec-diff 2024-11 2025-03", color: "#e2e8f0" },
      { text: "", color: "" },
      { text: "+ tools/list_changed", color: G },
      { text: "~ resources/read content-type", color: A },
      { text: "- stdio version (deprecated)", color: "#f87171" },
    ],
  },
  {
    title: "release-notes — bash",
    subtitle: "placeholder — auto changelog drafter",
    accent: DIM,
    badge: "[WIP]",
    lines: [
      { text: "softogram@cli:~$ release-notes --since v0.1.0", color: "#e2e8f0" },
      { text: "", color: "" },
      { text: "drafting from commits …", color: "#94a3b8" },
      { text: "(not wired yet — horizontal scroll demo)", color: DIM },
    ],
  },
];

/**
 * Interactive proof: fixed title + horizontally scrollable tool cards.
 * Real Terminal first; dummy cards follow so scroll ↔ is obvious.
 */
export default function TerminalSection({ lineStart = 10 }) {
  return (
    <Section id="terminal" topRule bg="#0d1117" testId="terminal-section">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-0">
        {/* Fixed header — stays put while tools scroll horizontally (no divider — same section) */}
        <div
          className="shrink-0 pb-2"
          style={{ background: "#0d1117" }}
          data-testid="terminal-header"
        >
          <GutterRow lineNum={lineStart}>
            <div>
              <div
                className="text-xs mb-2 uppercase tracking-widest"
                style={{ color: G, fontFamily: "var(--font-mono)" }}
              >
                # interactive proof
              </div>
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <h2
                  className="leading-tight flex flex-wrap items-center gap-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    color: "#e2e8f0",
                  }}
                >
                  {/*
                    Issue #83: the old headline was "Run the actual tool." above one live
                    demo and three labelled stubs, so it promised more than the section
                    delivers. The Confirmed badge stays attached to the one tool that
                    actually is confirmed.
                  */}
                  Run the real one. Preview the rest.{" "}
                  <Badge
                    tier="confirmed"
                    href="https://github.com/Softogram/softogram-mcp-spec-migration-checker"
                  />
                </h2>
                <span className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                  1 live · 3 previews · scroll ← →
                </span>
              </div>
            </div>
          </GutterRow>
        </div>

        {/* Horizontally scrollable tools strip */}
        <GutterRow lineNum={lineStart + 1}>
          <div className="relative -mx-1">
            <div
              className="pane-scroll-x flex gap-5 py-4 px-1"
              style={{ overflowX: "auto", overflowY: "hidden" }}
              data-testid="terminal-tools-scroll"
            >
              {/*
                maxWidth is 100% of the scroll container, not 85vw (issue #81). The strip
                sits inside the 48px line-number gutter plus section padding, so at 390px
                the container is ~294px while 85vw resolves to 331px - every card
                overflowed the right edge and the first card's "run" button was cut off.
                Percent tracks the real available width at any viewport; vw does not.
              */}
              <div className="shrink-0" style={{ width: 520, maxWidth: "100%" }}>
                <Terminal />
              </div>
              {DUMMY_TOOLS.map((tool) => (
                <DummyToolCard key={tool.title} {...tool} />
              ))}
            </div>
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0 w-16"
              style={{
                background: "linear-gradient(to left, #0d1117, transparent)",
              }}
            />
          </div>
        </GutterRow>
      </div>
    </Section>
  );
}
