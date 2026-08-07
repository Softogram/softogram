/**
 * Redesign home — Hero, Terminal, Build Log, Shipped, Services, Contact (Phase 4 wired).
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import ClaimBlock from "@/components/redesign/ClaimBlock";
import TerminalSection from "@/components/redesign/TerminalSection";
import BuildLogSection from "@/components/redesign/BuildLog";
import ShippedSection from "@/components/redesign/ShippedSection";
import ServicesSection from "@/components/redesign/ServicesSection";
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
import SeoHead from "@/components/redesign/SeoHead";
import TestimonialsSection from "@/components/redesign/TestimonialsSection";
import { capture } from "@/lib/analytics";
import { BOOKING_URL, SUPPORT_EMAIL } from "@/data/site";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_BY_TYPE = {
  custom: "Custom Software",
  saas: "SaaS Platforms",
  ai: "AI Agent Systems",
  tooling: "CLI & Dev Tooling",
};

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

function ContactSection({ lineStart }) {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    message: "",
    type: "custom",
    company_website: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  let ln = lineStart;

  useEffect(() => {
    capture("contact_form_viewed");
  }, []);

  const inputBase = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    color: "#e2e8f0",
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    outline: "none",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API}/contact`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        service: SERVICE_BY_TYPE[form.type] || form.type,
        message: form.message,
        company_website: form.company_website || "",
      });
      if (response.data?.status === "success") {
        capture("contact_form_submitted");
        toast.success(response.data.message || "Thank you! We'll be in touch.");
        setForm(emptyForm);
        setSubmitted(true);
      } else {
        const msg = "Failed to submit. Please try again.";
        setError(msg);
        capture("contact_form_failed", { reason: "bad_status" });
        toast.error(msg);
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      const msg =
        status === 429
          ? "Too many requests. Please try again later."
          : detail || err.response?.data?.message || "Failed to submit. Please try again.";
      const text = typeof msg === "string" ? msg : "Failed to submit. Please try again.";
      setError(text);
      capture("contact_form_failed", { reason: status || "network" });
      toast.error(text);
    } finally {
      setLoading(false);
    }
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
              responds within 24 hours · {SUPPORT_EMAIL}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="booking-cta"
                className="px-4 py-2 text-xs font-semibold rounded-sm"
                style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
                onClick={() => capture("booking_clicked", { placement: "contact" })}
              >
                book a free 30-min call →
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="px-4 py-2 text-xs rounded-sm"
                style={{
                  color: DIM,
                  border: `1px solid ${BORDER}`,
                  fontFamily: "var(--font-mono)",
                }}
                data-testid="contact-email-link"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
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
                  <button
                    type="button"
                    className="mt-5 text-xs underline"
                    style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                    onClick={() => setSubmitted(false)}
                    data-testid="contact-send-another"
                  >
                    send another →
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* Honeypot — hidden from humans (issue #5) */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-10000px",
                      top: "auto",
                      width: 1,
                      height: 1,
                      overflow: "hidden",
                    }}
                  >
                    <label htmlFor="company_website">Company website</label>
                    <input
                      id="company_website"
                      type="text"
                      name="company_website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company_website}
                      onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                      data-testid="contact-honeypot"
                    />
                  </div>
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                          disabled={loading}
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
                      disabled={loading}
                      onFocus={(e) => {
                        e.target.style.borderColor = `${G}55`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BORDER;
                      }}
                    />
                  </div>
                  {error && (
                    <div
                      className="md:col-span-2 text-xs"
                      style={{ color: A, fontFamily: "var(--font-mono)" }}
                      data-testid="contact-error"
                    >
                      {error}
                    </div>
                  )}
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 text-sm font-semibold rounded-sm transition-all duration-150 hover:opacity-90 disabled:opacity-60"
                      style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
                      data-testid="contact-submit-button"
                    >
                      {loading ? "sending…" : "send →"}
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
      <SeoHead
        title="Softogram | Software that actually ships"
        description="Softogram builds real tools and client software — Go binaries, changelogs, and production systems. No roadmap theater."
      />
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
      <ShippedSection lineStart={ln + 20} />
      <ServicesSection lineStart={ln + 30} />
      <div className="max-w-7xl mx-auto px-6">
        <TestimonialsSection startLine={ln + 35} />
      </div>
      <ContactSection lineStart={ln + 40} />
    </>
  );
}
