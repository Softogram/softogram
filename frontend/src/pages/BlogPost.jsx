/**
 * Blog post — Phase 7.
 */
import React from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug } from "@/data/blogPosts";
import { G, DIM, BORDER, CARD } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ paddingTop: 80 }}
        data-testid="blog-post-not-found"
      >
        <SeoHead title="Post not found | Softogram" />
        <div className="text-5xl mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          404
        </div>
        <p className="mb-6" style={{ color: DIM }}>
          Post not found.
        </p>
        <Link to="/blog" className="text-sm" style={{ color: G }} data-testid="blog-post-back">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const lines = post.content.split("\n");

  return (
    <div style={{ paddingTop: 80 }} data-testid="blog-post-page">
      <SeoHead title={`${post.title} | Softogram Blog`} description={post.excerpt} />

      <div className="relative h-64 md:h-96 overflow-hidden" style={{ background: "#010409" }}>
        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,7,13,0.3) 0%, #0d1117 100%)" }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-28">
        <div className="pt-10 pb-8" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs mb-6 transition-colors duration-200"
            style={{ color: DIM, fontFamily: "var(--font-mono)" }}
            data-testid="blog-post-back"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = DIM;
            }}
          >
            ← Back to Blog
          </Link>
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((t) => (
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
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
            data-testid="blog-post-title"
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${G}22`, color: G }}
            >
              {post.author[0]}
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: "#cbd5e1" }}>
                {post.author}
              </div>
              <div className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {post.readTime} min read
              </div>
            </div>
          </div>
        </div>

        <article className="pt-10" data-testid="blog-post-content">
          {lines.map((line, i) => {
            if (line.startsWith("# ")) return null;
            if (line.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="text-2xl font-bold mt-10 mb-4"
                  style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
                >
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="text-lg font-semibold mt-8 mb-3" style={{ color: "#cbd5e1" }}>
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.trim() === "") return <div key={i} className="h-4" />;
            return (
              <p key={i} className="text-base leading-relaxed mb-2" style={{ color: "#cbd5e1" }}>
                {line}
              </p>
            );
          })}
        </article>

        <div
          className="mt-16 p-8 rounded-sm text-center"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <h3
            className="text-xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
          >
            Want to build something like this?
          </h3>
          <p className="text-sm mb-6" style={{ color: DIM }}>
            Softogram turns ideas into production-grade software.
          </p>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm transition-all duration-200 hover:opacity-90"
            style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
            data-testid="blog-post-cta"
          >
            Start a conversation →
          </Link>
        </div>
      </div>
    </div>
  );
}
