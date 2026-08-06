import React, { useState } from "react";
import { G, DIM, GutterRow, Section, Reveal } from "./homePrimitives";

export const SERVICES = [
  {
    title: "Custom Software",
    desc: "End-to-end engineering. Web apps, internal tools, APIs, data pipelines. Scoped, built, shipped.",
    tags: ["Go", "React", "TypeScript"],
  },
  {
    title: "AI Agent Systems",
    desc: "Production LLM agents: structured tool use, checkpoint memory, observable outputs. Not demos — deployments.",
    tags: ["MCP", "LLM APIs", "Go"],
  },
  {
    title: "SaaS Platforms",
    desc: "Full-stack SaaS: auth, billing, multi-tenancy, and infra that scales past MVP without rewrites.",
    tags: ["Stripe", "Postgres", "Auth"],
  },
  {
    title: "CLI & Dev Tooling",
    desc: "Developer tools that integrate into existing pipelines. Cross-platform binaries, not another dashboard.",
    tags: ["Go", "CLI", "CI/CD"],
  },
  {
    title: "Cloud Infrastructure",
    desc: "Deployment pipelines, containerization, observability. Wired from day one — not bolted on at launch.",
    tags: ["AWS", "Docker", "GH Actions"],
  },
  {
    title: "API & Integration",
    desc: "Connect systems that were never designed to talk. Robust, tested, documented, maintained.",
    tags: ["REST", "GraphQL", "Webhooks"],
  },
];

const TAG_H = 22;

function ServiceRow({ svc, lineNum, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Reveal delay={delay}>
      <GutterRow lineNum={lineNum}>
        <div
          className="flex flex-wrap lg:flex-nowrap items-baseline gap-3 py-2 px-4 rounded-sm transition-all duration-150 -ml-4"
          style={{
            background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
            borderLeft: `2px solid ${hovered ? G : "transparent"}`,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          data-testid="service-row"
        >
          <div className="w-44 shrink-0 self-start">
            <span className="text-sm font-semibold leading-[1.5]" style={{ color: "#e2e8f0" }}>
              {svc.title}
            </span>
          </div>
          <p className="text-sm leading-relaxed flex-1 self-start min-w-[12rem]" style={{ color: DIM }}>
            {svc.desc}
          </p>
          <div
            className="shrink-0 flex items-center gap-1.5"
            style={{ width: 212, height: TAG_H }}
          >
            {svc.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-1.5 rounded-sm whitespace-nowrap"
                style={{
                  background: `${G}0a`,
                  color: G,
                  border: `1px solid ${G}1a`,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.63rem",
                  lineHeight: `${TAG_H - 2}px`,
                  height: TAG_H,
                  display: "inline-block",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </GutterRow>
    </Reveal>
  );
}

/**
 * Services: sticky header inside one scroll pane (no divider).
 */
export default function ServicesSection({ lineStart = 50 }) {
  let ln = lineStart;

  const take = () => {
    const current = ln;
    ln += 1;
    return current;
  };

  return (
    <Section id="services" topRule bg="#0d1117" testId="services-section">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative">
          <div
            className="pane-scroll"
            style={{ height: 420, overflowY: "auto", overflowX: "hidden" }}
            data-testid="services-scroll"
          >
            <div
              className="sticky top-0 z-10 pb-3"
              style={{ background: "#0d1117" }}
              data-testid="services-header"
            >
              <GutterRow lineNum={take()}>
                <div>
                  <div className="text-xs mb-1" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                    # services
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
                    What we build{" "}
                    <span className="italic" style={{ color: G }}>
                      for clients.
                    </span>
                  </h2>
                </div>
              </GutterRow>
            </div>

            <div className="pb-8">
              {SERVICES.map((svc, i) => (
                <ServiceRow key={svc.title} svc={svc} lineNum={take()} delay={i * 50} />
              ))}
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
