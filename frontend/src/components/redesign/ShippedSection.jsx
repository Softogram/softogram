import React, { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "./Badge";
import ClaimBlock from "./ClaimBlock";
import { G, A, DIM, BORDER, CARD, GutterRow, Section, Reveal } from "./homePrimitives";

export const SHIPPED = [
  {
    name: "mcp-migration-checker",
    lang: "Go",
    version: "v0.1.1",
    status: "confirmed",
    repoUrl: "https://github.com/Softogram/softogram-mcp-spec-migration-checker",
    desc: "CLI tool that scans MCP server implementations against spec changes. Emits CONFIRMED / REPORTED findings with file:line references. Cross-platform binary via GitHub Actions.",
    claimOld: "enterprise-grade AI compliance automation platform",
    claimNew: "Go binary, 4 finding types, exit-code aware — v0.1.1 out now",
    honesty:
      "v0.1.0 Linux binary broke on glibc < 2.28. Caught in testing, patched same day as v0.1.1.",
    tags: ["Go", "CLI", "MCP", "static-analysis"],
  },
  {
    name: "search-to-md",
    lang: "Go",
    version: "v0.1.0",
    status: "confirmed",
    repoUrl: "https://github.com/Softogram/softogram-search-to-markdown",
    desc: "Free, open-source CLI that turns a web search into clean, source-attributed Markdown for an AI agent to read directly. Tavily-powered.",
    claimOld: "intelligent research automation with enterprise Tavily integration",
    claimNew: "single-query Tavily → Markdown, Go. Rate-limit retry deferred.",
    honesty:
      "Rate-limit handling incomplete — results silently dropped above free tier. Fix is scoped, not merged.",
    tags: ["Go", "Tavily", "Markdown"],
  },
];

function ShippedCard({ item, lineNum }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = item.status === "confirmed" ? G : A;

  return (
    <GutterRow lineNum={lineNum}>
      <div
        className="rounded-sm overflow-hidden transition-all duration-200"
        style={{
          background: CARD,
          border: `1px solid ${hovered ? `${accentColor}33` : BORDER}`,
          transform: hovered ? "translateY(-2px)" : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-testid="shipped-card"
      >
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
        >
          <span className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
            {item.lang}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#e2e8f0",
              border: `1px solid ${BORDER}`,
              fontFamily: "var(--font-mono)",
            }}
          >
            {item.version}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "#e2e8f0", fontFamily: "var(--font-mono)" }}
          >
            {item.name}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {item.repoUrl && (
              <a
                href={item.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors duration-150"
                style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = G;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = DIM;
                }}
                onClick={(e) => e.stopPropagation()}
              >
                github ↗
              </a>
            )}
            <Badge tier={item.status} href={item.repoUrl || undefined} />
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed mb-4" style={{ color: DIM }}>
            {item.desc}
          </p>

          <ClaimBlock
            old={item.claimOld}
            replacement={item.claimNew}
            badge={item.status}
            badgeHref={item.repoUrl || undefined}
            className="mb-4"
          />

          <div
            className="flex items-start gap-2 px-3 py-2 rounded-sm text-xs"
            style={{
              background: `${accentColor}08`,
              border: `1px solid ${accentColor}1e`,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span style={{ color: accentColor, flexShrink: 0 }}>note:</span>
            <span style={{ color: DIM }}>{item.honesty}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs rounded-sm"
                style={{
                  background: `${G}0a`,
                  color: G,
                  border: `1px solid ${G}1e`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GutterRow>
  );
}

/**
 * Shipped products: sticky header inside one scroll pane (no divider).
 */
export default function ShippedSection({ lineStart = 40 }) {
  let ln = lineStart;

  const take = () => {
    const current = ln;
    ln += 1;
    return current;
  };

  return (
    <Section id="shipped" topRule bg="#080c10" testId="shipped-section">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative">
          <div
            className="pane-scroll"
            style={{ height: 560, overflowY: "auto", overflowX: "hidden" }}
            data-testid="shipped-scroll"
          >
            <div
              className="sticky top-0 z-10 pb-3"
              style={{ background: "#080c10" }}
              data-testid="shipped-header"
            >
              <GutterRow lineNum={take()}>
                <div>
                  <div className="text-xs mb-1" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                    # what we&apos;ve shipped
                  </div>
                  <h2
                    className="leading-tight"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                      color: "#e2e8f0",
                    }}
                  >
                    Real tools,{" "}
                    <span className="italic" style={{ color: G }}>
                      with real changelogs.
                    </span>
                  </h2>
                </div>
              </GutterRow>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-2">
              {SHIPPED.map((item, i) => (
                <Reveal key={item.name} delay={i * 100}>
                  <ShippedCard item={item} lineNum={take()} />
                </Reveal>
              ))}
            </div>

            <GutterRow lineNum={take()}>
              <div className="pt-4 pb-6">
                <Link
                  to="/products"
                  className="text-xs transition-colors duration-150"
                  style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = G;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = DIM;
                  }}
                >
                  → full product listing with reviews
                </Link>
              </div>
            </GutterRow>
          </div>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-14"
            style={{ background: "linear-gradient(to top, #080c10, transparent)" }}
          />
        </div>
      </div>
    </Section>
  );
}
