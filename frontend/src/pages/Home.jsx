/**
 * Redesign home — Phase 2 Hero/Contact + Phase 3 Terminal/Build Log.
 * Shipped / Services arrive in Phase 4.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClaimBlock from "@/components/redesign/ClaimBlock";
import TerminalSection from "@/components/redesign/TerminalSection";
import BuildLogSection from "@/components/redesign/BuildLog";
import {
  G,
  A,
  DIM,
  BORDER,
  CARD,
  GutterRow,
  Section,
  Reveal,
} from "@/components/redesign/homePrimitives";

function useRepoStats(repo) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.id) {
          setStats({
            stars: d.stargazers_count,
            issues: d.open_issues_count,
            pushedAt: d.pushed_at,
          });
        }
      })
      .catch(() => {});
  }, [repo]);
  return stats;
}

function AnimatedHeadline({ active }) {
  const words = [
    { text: "We" },
    { text: "build" },
    { text: "software", green: true },
    { text: "that" },
    { text: "actually", green: true },
    { text: "ships." },
  ];

  return (
    <h1
      className="leading-none tracking-tight"
      data-testid="hero-headline"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: "clamp(2.6rem, 6.5vw, 5.2rem)",
        color: "#e2e8f0",
      }}
    >
      <div style={{ overflow: "hidden", paddingBottom: "0.06em" }}>
        {words.slice(0, 3).map((w, i) => (
          <span
            key={i}
            className="inline-block mr-[0.18em]"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(52px)",
              filter: active ? "blur(0)" : "blur(6px)",
              transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 90 + 60}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 90 + 60}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 90 + 60}ms`,
              fontStyle: w.green ? "italic" : "normal",
              color: w.green ? G : "#e2e8f0",
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
      <div style={{ overflow: "hidden", paddingBottom: "0.36em" }}>
        {words.slice(3).map((w, i) => (
          <span
            key={i}
            className="inline-block mr-[0.18em]"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(52px)",
              filter: active ? "blur(0)" : "blur(6px)",
              transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${(i + 3) * 90 + 60}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${(i + 3) * 90 + 60}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${(i + 3) * 90 + 60}ms`,
              fontStyle: w.green ? "italic" : "normal",
              color: w.green ? G : "#e2e8f0",
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
    </h1>
  );
}

function ComingSoonPane({ id, title, note, lineNum }) {
  return (
    <Section id={id} topRule bg="#0d1117">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <GutterRow lineNum={lineNum}>
          <div className="text-xs mb-2" style={{ color: A, fontFamily: "var(--font-mono)" }}>
            # pending · redesign phase later
          </div>
          <h2
            className="leading-tight mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              color: "#e2e8f0",
            }}
          >
            {title}
          </h2>
          <p className="text-sm" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
            {note}
          </p>
        </GutterRow>
      </div>
    </Section>
  );
}

function ContactSection({ lineStart }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    type: "custom",
  });
  const [submitted, setSubmitted] = useState(false);
  let ln = lineStart;

  const inputBase = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    color: "#e2e8f0",
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    outline: "none",
  };

  // Phase 2: UI-only success state. Phase 4 wires POST /api/contact.
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section id="contact" topRule testId="contact-section">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <GutterRow lineNum={ln++}>
          <Reveal>
            <div
              className="mb-2 text-xs uppercase tracking-widest"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              # contact
            </div>
            <h2
              className="leading-tight mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: "#e2e8f0",
              }}
            >
              Ready to build{" "}
              <span className="italic" style={{ color: G }}>
                something real?
              </span>
            </h2>
            <p className="text-sm" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
              responds within 24 hours · support@softogram.in
            </p>
          </Reveal>
        </GutterRow>

        <GutterRow lineNum={ln++}>
          <Reveal delay={100}>
            <div
              className="rounded-sm p-6 md:p-8 mt-6"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
              data-testid="contact-form"
            >
              {submitted ? (
                <div className="text-center py-8" data-testid="contact-success">
                  <div className="text-3xl mb-3" style={{ color: G }}>
                    ✓
                  </div>
                  <p className="text-sm" style={{ color: "#e2e8f0", fontFamily: "var(--font-mono)" }}>
                    received. back to you within 24 hours.
                  </p>
                  <p className="text-xs mt-3" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                    (UI stub — API wiring lands in redesign Phase 4)
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-xs mb-1" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                      name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-sm"
                      style={inputBase}
                      data-testid="contact-name-input"
                      onFocus={(e) => {
                        e.target.style.borderColor = `${G}55`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BORDER;
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                      email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@org.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-sm"
                      style={inputBase}
                      data-testid="contact-email-input"
                      onFocus={(e) => {
                        e.target.style.borderColor = `${G}55`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BORDER;
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs mb-1" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                      phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91-9876501234"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-sm"
                      style={inputBase}
                      data-testid="contact-phone-input"
                      onFocus={(e) => {
                        e.target.style.borderColor = `${G}55`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BORDER;
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs mb-1" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                      type
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3" data-testid="contact-service-select">
                      {[
                        { v: "custom", l: "custom project" },
                        { v: "saas", l: "saas" },
                        { v: "ai", l: "ai / agents" },
                        { v: "tooling", l: "dev tooling" },
                      ].map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => setForm({ ...form, type: o.v })}
                          className="px-3 py-1 text-xs rounded-sm transition-all duration-150"
                          style={{
                            background: form.type === o.v ? `${G}14` : "transparent",
                            border: `1px solid ${form.type === o.v ? `${G}44` : BORDER}`,
                            color: form.type === o.v ? G : DIM,
                            fontFamily: "var(--font-mono)",
                          }}
                          data-testid={`contact-type-${o.v}`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                    <textarea
                      required
                      rows={4}
                      placeholder="what are you building?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-sm resize-none"
                      style={{ ...inputBase, resize: "none" }}
                      data-testid="contact-message-textarea"
                      onFocus={(e) => {
                        e.target.style.borderColor = `${G}55`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BORDER;
                      }}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 text-sm font-semibold rounded-sm transition-all duration-150 hover:opacity-90"
                      style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
                      data-testid="contact-submit-button"
                    >
                      send →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </GutterRow>
      </div>
    </Section>
  );
}

export default function Home() {
  const [heroActive, setHeroActive] = useState(false);
  const stats = useRepoStats("Softogram/softogram-mcp-spec-migration-checker");
  let ln = 1;

  useEffect(() => {
    const t = setTimeout(() => setHeroActive(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Section id="hero" bg="#0d1117" testId="hero-section">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: "65vw",
              height: "65vw",
              top: "-25%",
              left: "-15%",
              background: "radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 65%)",
              filter: "blur(80px)",
              animation: "aurora1 22s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "45vw",
              height: "45vw",
              top: "10%",
              right: "-10%",
              background: "radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 65%)",
              filter: "blur(100px)",
              animation: "aurora2 30s ease-in-out infinite alternate",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
          <GutterRow lineNum={ln++}>
            <div
              className="inline-flex items-center gap-3 mb-6"
              style={{
                opacity: heroActive ? 1 : 0,
                transform: heroActive ? "none" : "translateY(10px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <span
                className="px-2.5 py-1 text-xs rounded-sm"
                style={{
                  background: `${G}10`,
                  color: G,
                  border: `1px solid ${G}28`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                softogram · main
              </span>
              {stats && (
                <span
                  className="text-xs flex items-center gap-2"
                  style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: G, boxShadow: `0 0 4px ${G}` }}
                  />
                  {stats.stars}★ · pushed{" "}
                  {new Date(stats.pushedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </GutterRow>

          <GutterRow lineNum={ln++}>
            <div className="mb-6">
              <AnimatedHeadline active={heroActive} />
            </div>
          </GutterRow>

          <GutterRow lineNum={ln++} marker="-">
            <Reveal delay={500}>
              <div
                className="py-1"
                style={{ opacity: heroActive ? 1 : 0, transition: "opacity 0.7s ease 600ms" }}
              >
                <ClaimBlock
                  old="AI-native enterprise software factory delivering transformative digital experiences"
                  replacement="Two tools shipped in two weeks. Go binaries. Real changelogs. No roadmap theater."
                  badge="confirmed"
                  badgeHref="https://github.com/Softogram/softogram-mcp-spec-migration-checker"
                />
              </div>
            </Reveal>
          </GutterRow>

          <GutterRow lineNum={ln++} marker="+">
            <Reveal delay={650}>
              <div style={{ opacity: heroActive ? 1 : 0, transition: "opacity 0.7s ease 750ms" }}>
                <ClaimBlock
                  old="98% client retention · 40+ projects · AI-native"
                  replacement="mcp-migration-checker: 4 findings, 3 confirmed, exit 0"
                  badge="confirmed"
                  badgeHref="https://github.com/Softogram/softogram-mcp-spec-migration-checker/releases/tag/v0.1.1"
                />
              </div>
            </Reveal>
          </GutterRow>

          <GutterRow lineNum={ln++}>
            <Reveal delay={750}>
              <div
                className="flex flex-wrap gap-3 mt-6"
                style={{ opacity: heroActive ? 1 : 0, transition: "opacity 0.7s ease 850ms" }}
              >
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm transition-all duration-150 hover:opacity-90"
                  style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
                  data-testid="hero-cta-quote"
                >
                  get in touch ↓
                </a>
                <a
                  href="https://github.com/Softogram/softogram-mcp-spec-migration-checker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm transition-all duration-150"
                  style={{ color: DIM, border: `1px solid ${BORDER}`, fontFamily: "var(--font-mono)" }}
                  data-testid="hero-cta-work"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#e2e8f0";
                    e.currentTarget.style.borderColor = `${G}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = DIM;
                    e.currentTarget.style.borderColor = BORDER;
                  }}
                >
                  view on github ↗
                </a>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm"
                  style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                >
                  products →
                </Link>
              </div>
            </Reveal>
          </GutterRow>
        </div>
      </Section>

      <TerminalSection lineStart={ln} />
      <BuildLogSection lineStart={ln + 5} />
      <ComingSoonPane
        id="shipped"
        title="What we've shipped"
        note="Product cards land in redesign Phase 4 — browse /products for the scaffold."
        lineNum={ln + 20}
      />
      <ComingSoonPane
        id="services"
        title="Services"
        note="Service rows land in redesign Phase 4."
        lineNum={ln + 21}
      />

      <ContactSection lineStart={ln} />
    </>
  );
}
