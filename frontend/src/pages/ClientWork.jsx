/**
 * Client Work — CMS-backed case studies (issue #17).
 */
import React, { useEffect, useState } from "react";
import { INDUSTRIES } from "@/data/clientProjects";
import { fetchPublishedProjects } from "@/lib/cmsApi";
import { G, DIM, BORDER, CARD, Reveal } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";
import { breadcrumbLd } from "@/lib/seo";

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
      data-testid="client-project-modal-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl rounded-sm overflow-hidden max-h-[90vh] overflow-y-auto pane-scroll"
        style={{ background: CARD, border: `1px solid ${G}33` }}
        onClick={(e) => e.stopPropagation()}
        data-testid="client-project-modal"
      >
        <div className="relative h-56">
          <img src={project.img} alt={project.client} className="w-full h-full object-cover opacity-40" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, rgba(7,7,13,0.4) 0%, ${CARD} 100%)` }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-sm text-white"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            data-testid="client-project-modal-close"
            aria-label="Close"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-6 flex gap-2">
            <span
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: `${G}22`,
                color: G,
                border: `1px solid ${G}44`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {project.industry}
            </span>
            <span
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: `${G}14`,
                color: G,
                border: `1px solid ${G}33`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {project.year}
            </span>
          </div>
        </div>
        <div className="p-8">
          <div
            className="text-xs mb-2"
            style={{ color: DIM, fontFamily: "var(--font-mono)" }}
            data-testid="client-project-modal-client"
          >
            {project.client}
          </div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
            data-testid="client-project-modal-title"
          >
            {project.title}
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: DIM }}>
            {project.desc}
          </p>

          <div className="mb-6">
            <h4
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              Services provided
            </h4>
            <div className="flex flex-wrap gap-2" data-testid="client-project-modal-services">
              {project.services.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 text-xs rounded-sm"
                  style={{
                    background: `${G}14`,
                    color: G,
                    border: `1px solid ${G}33`,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div
            className="p-4 rounded-sm"
            style={{ background: `${G}0f`, border: `1px solid ${G}33` }}
            data-testid="client-project-modal-outcome"
          >
            <div
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              Outcome
            </div>
            <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
              {project.outcome}
            </p>
            {Array.isArray(project.metrics) && project.metrics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" data-testid="client-project-metrics">
                {project.metrics.map((m) => (
                  <span
                    key={`${m.label}-${m.value}`}
                    className="text-xs px-2 py-1 rounded-sm"
                    style={{ border: `1px solid ${G}44`, color: G, fontFamily: "var(--font-mono)" }}
                  >
                    {m.label}: {m.value}
                  </span>
                ))}
              </div>
            )}
          </div>
          {project.url && (
            <a
              href={project.url}
              target={project.url.startsWith("http") ? "_blank" : undefined}
              rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-block mt-4 text-xs font-semibold"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
              data-testid="client-project-modal-link"
              onClick={(e) => e.stopPropagation()}
            >
              view project →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientWork() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchPublishedProjects();
      if (!cancelled) setProjects(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const industryFilters = [
    "All",
    ...Array.from(
      new Set([
        ...INDUSTRIES.filter((i) => i !== "All"),
        ...projects.map((p) => p.industry).filter(Boolean),
      ]),
    ),
  ];
  const filtered = filter === "All" ? projects : projects.filter((p) => p.industry === filter);

  return (
    <>
      <SeoHead
        title="Client Work | Softogram"
        description="Real client work, open-source tools, and in-house products from Softogram — every project links to a live site or a GitHub release."
        canonical="https://softogram.in/client-work"
        jsonLd={breadcrumbLd([{ name: "Client Work", path: "/client-work" }])}
      />
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}

      <div style={{ paddingTop: 80 }} data-testid="client-work-page">
        <section className="relative py-24 overflow-hidden" data-testid="client-work-hero">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 30% 50%, rgba(74,222,128,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div
                  className="text-xs font-medium uppercase tracking-widest mb-5"
                  style={{ color: G, fontFamily: "var(--font-mono)" }}
                >
                  Client Work
                </div>
                <h1
                  className="mb-6 leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
                    color: "#e2e8f0",
                  }}
                >
                  What we&apos;ve{" "}
                  <span className="italic" style={{ color: G }}>
                    actually built.
                  </span>
                </h1>
                <p className="text-lg leading-relaxed" style={{ color: DIM, fontWeight: 300 }}>
                  Client work, open-source tools, and products we&apos;re building ourselves —
                  every one verifiable by a live URL, a GitHub release, or both.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "2", label: "Open-source tools shipped" },
                  { num: "1", label: "Live production storefront" },
                  { num: "1", label: "Game in active development" },
                  { num: "100%", label: "Claims are verifiable" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-5 rounded-sm text-center"
                    style={{ background: CARD, border: `1px solid ${BORDER}` }}
                  >
                    <div
                      className="text-3xl font-bold mb-1"
                      style={{ fontFamily: "var(--font-display)", color: G }}
                    >
                      {s.num}
                    </div>
                    <div className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex gap-3 flex-wrap" data-testid="client-work-filter">
            {industryFilters.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setFilter(ind)}
                className="px-4 py-1.5 text-xs rounded-sm transition-all duration-200"
                style={{
                  background: filter === ind ? `${G}22` : "transparent",
                  border: `1px solid ${filter === ind ? `${G}55` : BORDER}`,
                  color: filter === ind ? G : DIM,
                  fontFamily: "var(--font-mono)",
                }}
                data-testid={`client-work-filter-${slugify(ind)}`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <div
                  role="button"
                  tabIndex={0}
                  className="group rounded-sm overflow-hidden cursor-pointer transition-all duration-300 flex flex-col"
                  style={{ background: CARD, border: `1px solid ${BORDER}`, minHeight: 320 }}
                  onClick={() => setSelected(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(p);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = `${G}55`;
                    e.currentTarget.style.boxShadow = `0 20px 60px ${G}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  data-testid="client-project-card"
                >
                  <div className="relative h-52 overflow-hidden" style={{ background: "#010409" }}>
                    <img
                      src={p.img}
                      alt={p.client}
                      className="w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(to bottom, transparent 30%, ${CARD})` }}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span
                        className="text-xs px-2.5 py-1 rounded-sm"
                        style={{
                          background: `${G}22`,
                          color: G,
                          border: `1px solid ${G}44`,
                          fontFamily: "var(--font-mono)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {p.industry}
                      </span>
                    </div>
                    <div
                      className="absolute top-4 right-4 text-xs px-2.5 py-1 rounded-sm"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: DIM,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {p.year}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div
                      className="text-xs mb-2 font-medium"
                      style={{ color: G, fontFamily: "var(--font-mono)" }}
                    >
                      {p.client}
                    </div>
                    <h3
                      className="text-xl font-semibold mb-3"
                      style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: DIM }}>
                      {p.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.services.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 rounded-sm"
                          style={{
                            background: `${G}14`,
                            color: G,
                            border: `1px solid ${G}28`,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs font-medium" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                      ✓ {p.outcome.split(".")[0]}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20" style={{ color: DIM }} data-testid="client-work-empty">
              No projects in this category yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
