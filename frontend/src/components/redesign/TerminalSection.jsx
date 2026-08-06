import React from "react";
import Badge from "./Badge";
import Terminal from "./Terminal";
import { G, GutterRow, Section } from "./homePrimitives";

/**
 * Interactive proof: heading + Terminal share one gutter column so they read
 * as a single section (not a separate block under the header).
 */
export default function TerminalSection({ lineStart = 10 }) {
  return (
    <Section id="terminal" topRule bg="#0d1117" testId="terminal-section">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <GutterRow lineNum={lineStart}>
          <div className="max-w-2xl">
            <div className="mb-6">
              <div
                className="text-xs mb-2 uppercase tracking-widest"
                style={{ color: G, fontFamily: "var(--font-mono)" }}
              >
                # interactive proof
              </div>
              <h2
                className="leading-tight flex flex-wrap items-center gap-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                  color: "#e2e8f0",
                }}
              >
                Run the actual tool.{" "}
                <Badge
                  tier="confirmed"
                  href="https://github.com/Softogram/softogram-mcp-spec-migration-checker"
                />
              </h2>
            </div>

            <Terminal />
          </div>
        </GutterRow>
      </div>
    </Section>
  );
}
