/**
 * Blog post — CMS-backed with seed fallback (issue #17).
 */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { fetchBlogBySlug } from "@/lib/cmsApi";
import { G, DIM, BORDER } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => (
    <h2 className="text-2xl font-bold pt-4" style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}>
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="text-xl font-semibold pt-3" style={{ color: "#e2e8f0" }}>
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-lg font-semibold pt-2" style={{ color: G }}>
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => (
    <li className="text-sm" style={{ color: DIM }}>
      {children}
    </li>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: G, textDecoration: "underline" }}>
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#e2e8f0", fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
  code: ({ children }) => (
    <code
      className="text-xs px-1.5 py-0.5 rounded-sm"
      style={{ background: "#161b22", color: G, fontFamily: "var(--font-mono)" }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className="text-xs p-4 rounded-sm overflow-x-auto"
      style={{ background: "#161b22", border: `1px solid ${BORDER}`, fontFamily: "var(--font-mono)" }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="pl-4 italic" style={{ borderLeft: `2px solid ${G}`, color: DIM }}>
      {children}
    </blockquote>
  ),
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined loading, null missing

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchBlogBySlug(slug);
      if (!cancelled) setPost(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 80 }} data-testid="blog-post-loading">
        <p style={{ color: DIM, fontFamily: "var(--font-mono)" }}>loading…</p>
      </div>
    );
  }

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

  const canonical = `https://softogram.in/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author || "Softogram" },
    publisher: {
      "@type": "Organization",
      name: "Softogram",
      logo: { "@type": "ImageObject", url: "https://softogram.in/softogram-logo.png" },
    },
    mainEntityOfPage: canonical,
  };

  return (
    <div style={{ paddingTop: 80 }} data-testid="blog-post-page">
      <SeoHead
        title={`${post.title} | Softogram Blog`}
        description={post.excerpt}
        canonical={canonical}
        image={post.coverImage}
        type="article"
        jsonLd={jsonLd}
      />

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
            className="inline-flex items-center gap-2 text-xs mb-6"
            style={{ color: DIM, fontFamily: "var(--font-mono)" }}
            data-testid="blog-post-back"
          >
            ← Back to Blog
          </Link>
          <div className="flex flex-wrap gap-2 mb-5">
            {(post.tags || []).map((t) => (
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
          <div className="text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
            {post.author} · {post.date} · {post.readTime || 5} min
          </div>
        </div>

        <article className="pt-10 space-y-3" data-testid="blog-post-content">
          <ReactMarkdown components={MARKDOWN_COMPONENTS}>{post.content || ""}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
