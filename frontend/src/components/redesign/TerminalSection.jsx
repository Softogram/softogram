import React from "react";
import Badge from "./Badge";
import Terminal from "./Terminal";
import { G, BORDER, GutterRow, Section } from "./homePrimitives";

export default function TerminalSection({ lineStart = 10 }) {
  let ln = lineStart;
  return (
    <Section id="terminal" topRule bg="#0d1117" testId="terminal-section">
      <div className="max-w-7xl mx-auto px-6">
        {/* Static header — sticky top:52 was sliding over the Terminal and clipping the title bar */}
        <div
          className="pt-6 pb-4"
          style={{ background: "#0d1117", borderBottom: `1px solid ${BORDER}` }}
        >
          <GutterRow lineNum={ln++}>
            <div>
              <div className="text-xs mb-1" style={{ color: G, fontFamily: "var(--font-mono)" }}>
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
          </GutterRow>
        </div>

        <div className="py-8">
          <GutterRow lineNum={ln++}>
            <div className="max-w-2xl">
              <Terminal />
            </div>
          </GutterRow>
        </div>
      </div>
    </Section>
  );
}
