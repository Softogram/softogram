/**
 * Blog index — Phase 7. Static posts (no localStorage / admin).
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedPosts } from "@/data/blogPosts";
import { G, DIM, BORDER, CARD, Reveal } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function Blog() {
  const posts = getPublishedPosts();
  const [activeTag, setActiveTag] = useState("All");
  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))];
  const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tags.includes(activeTag));
  const [featured, ...rest] = filtered;

  return (
    <div style={{ paddingTop: 80 }} data-testid="blog-page">
      <SeoHead
        title="Blog | Softogram"
        description="Engineering insights on AI agents, product design, and shipping software that works in production."
      />

      <section className="relative py-24 overflow-hidden" data-testid="blog-hero">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(74,222,128,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-5"
            style={{ color: G, fontFamily: "var(--font-mono)" }}
          >
            Softogram Blog
          </div>
          <h1
            className="mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "#e2e8f0",
            }}
          >
            Engineering{" "}
            <span className="italic" style={{ color: G }}>
              insights.
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: DIM, fontWeight: 300 }}>
            Deep-dives on AI, software architecture, product development, and the lessons we learn
            shipping real products.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex gap-3 flex-wrap" data-testid="blog-filter">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className="px-4 py-1.5 text-xs rounded-sm transition-all duration-200"
              style={{
                background: activeTag === tag ? `${G}22` : "transparent",
                border: `1px solid ${activeTag === tag ? `${G}55` : BORDER}`,
                color: activeTag === tag ? G : DIM,
                fontFamily: "var(--font-mono)",
              }}
              data-testid={`blog-filter-${slugify(tag)}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-28">
        {featured && (
          <Reveal>
            <Link to={`/blog/${featured.slug}`} data-testid="blog-featured">
              <div
                className="group rounded-sm overflow-hidden transition-all duration-300 mb-10"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${G}55`;
                  e.currentTarget.style.boxShadow = `0 20px 80px ${G}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div
                    className="relative h-64 lg:h-auto overflow-hidden"
                    style={{ background: "#010409", minHeight: 280 }}
                  >
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(to right, transparent 60%, ${CARD})` }}
                    />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {featured.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 rounded-sm"
                          style={{
                            background: `${G}14`,
                            color: G,
                            border: `1px solid ${G}28`,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2
                      className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
                      style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
                    >
                      {featured.title}
                    </h2>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: DIM }}>
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                        {new Date(featured.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                        ·
                      </span>
                      <span className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                        {featured.readTime} min read
                      </span>
                    </div>
                    <div className="mt-6 text-sm font-medium" style={{ color: DIM }}>
                      Read article →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => (
            <Reveal key={post.id} delay={i * 100}>
              <Link to={`/blog/${post.slug}`} data-testid="blog-post-card">
                <div
                  className="group rounded-sm overflow-hidden h-full flex flex-col transition-all duration-300"
                  style={{ background: CARD, border: `1px solid ${BORDER}` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = `${G}55`;
                    e.currentTarget.style.boxShadow = `0 16px 60px ${G}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="relative h-40 overflow-hidden" style={{ background: "#010409" }}>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(to bottom, transparent 40%, ${CARD})` }}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-sm"
                          style={{
                            background: `${G}14`,
                            color: G,
                            border: `1px solid ${G}28`,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3
                      className="text-lg font-semibold mb-3 leading-snug flex-1"
                      style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: DIM }}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}
                      >
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                        ·
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}
                      >
                        {post.readTime} min
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: DIM }}>
            No posts in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
