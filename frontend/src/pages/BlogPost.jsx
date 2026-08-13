/**
 * Blog post — CMS-backed with seed fallback (issue #17).
 * Comments (#43), share buttons (#44).
 */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  fetchBlogBySlug,
  fetchBlogComments,
  submitBlogComment,
  fetchPublishedBlogs,
} from "@/lib/cmsApi";
import { capture } from "@/lib/analytics";
import { G, DIM, BORDER, CARD } from "@/components/redesign/homePrimitives";
import { BOOKING_URL } from "@/data/site";
import SeoHead from "@/components/redesign/SeoHead";
import { breadcrumbLd } from "@/lib/seo";

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => (
    <h2
      className="text-2xl font-bold pt-4"
      style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
    >
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
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm" style={{ color: DIM }}>
      {children}
    </li>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: G, textDecoration: "underline" }}
    >
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
      style={{
        background: "#161b22",
        color: G,
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className="text-xs p-4 rounded-sm overflow-x-auto"
      style={{
        background: "#161b22",
        border: `1px solid ${BORDER}`,
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="pl-4 italic"
      style={{ borderLeft: `2px solid ${G}`, color: DIM }}
    >
      {children}
    </blockquote>
  ),
};

function ShareRow({ post, canonical }) {
  const [copied, setCopied] = useState(false);
  const text = `${post.title} — ${canonical}`;
  const encodedUrl = encodeURIComponent(canonical);
  const encodedText = encodeURIComponent(text);

  const track = (channel) => {
    capture("blog_post_shared", { channel, slug: post.slug });
  };

  const btnStyle = {
    border: `1px solid ${BORDER}`,
    color: DIM,
    background: "transparent",
    fontFamily: "var(--font-mono)",
  };

  return (
    <div
      className="flex flex-wrap gap-2 items-center"
      data-testid="blog-share-row"
    >
      <span
        className="text-xs mr-1"
        style={{ color: DIM, fontFamily: "var(--font-mono)" }}
      >
        share
      </span>
      <a
        href={`https://wa.me/?text=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="blog-share-whatsapp"
        className="px-3 py-1.5 text-xs rounded-sm"
        style={btnStyle}
        onClick={() => track("whatsapp")}
      >
        WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="blog-share-linkedin"
        className="px-3 py-1.5 text-xs rounded-sm"
        style={btnStyle}
        onClick={() => track("linkedin")}
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(post.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="blog-share-x"
        className="px-3 py-1.5 text-xs rounded-sm"
        style={btnStyle}
        onClick={() => track("x")}
      >
        X
      </a>
      <button
        type="button"
        data-testid="blog-share-copy"
        className="px-3 py-1.5 text-xs rounded-sm"
        style={btnStyle}
        onClick={async () => {
          track("copy");
          try {
            await navigator.clipboard.writeText(canonical);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? "copied" : "copy link"}
      </button>
    </div>
  );
}

function CommentsSection({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await fetchBlogComments(slug);
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await submitBlogComment(slug, {
        name,
        comment,
        company_website: honeypot,
      });
      setMessage(
        res.message || "Thanks — your comment was submitted for review.",
      );
      setName("");
      setComment("");
      setHoneypot("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not submit comment. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="pt-12 mt-12"
      style={{ borderTop: `1px solid ${BORDER}` }}
      data-testid="blog-comments"
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
      >
        Comments
      </h2>

      {comments.length === 0 ? (
        <p
          className="text-sm mb-8"
          style={{ color: DIM }}
          data-testid="blog-comments-empty"
        >
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-4 mb-10" data-testid="blog-comments-list">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-sm p-4"
              style={{ background: "#161b22", border: `1px solid ${BORDER}` }}
              data-testid="blog-comment"
            >
              <div
                className="text-xs mb-2"
                style={{ color: G, fontFamily: "var(--font-mono)" }}
              >
                {c.name}
                {c.createdAt
                  ? ` · ${new Date(c.createdAt).toLocaleDateString()}`
                  : ""}
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#cbd5e1" }}
              >
                {c.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-3 max-w-xl"
        data-testid="blog-comment-form"
      >
        <p
          className="text-xs"
          style={{ color: DIM, fontFamily: "var(--font-mono)" }}
        >
          Comments are moderated before they appear.
        </p>
        <label className="block text-xs" style={{ color: DIM }}>
          Name
          <input
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="blog-comment-name"
            className="mt-1 w-full px-3 py-2 text-sm rounded-sm"
            style={{
              background: "#161b22",
              border: `1px solid ${BORDER}`,
              color: "#e2e8f0",
            }}
          />
        </label>
        <label className="block text-xs" style={{ color: DIM }}>
          Comment
          <textarea
            required
            maxLength={5000}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            data-testid="blog-comment-body"
            className="mt-1 w-full px-3 py-2 text-sm rounded-sm"
            style={{
              background: "#161b22",
              border: `1px solid ${BORDER}`,
              color: "#e2e8f0",
            }}
          />
        </label>
        {/* Honeypot — visually hidden; bots fill it */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          data-testid="blog-comment-honeypot"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            height: 0,
            width: 0,
          }}
        />
        {message && (
          <p
            className="text-xs"
            style={{ color: G }}
            data-testid="blog-comment-success"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            className="text-xs"
            style={{ color: "#f85149" }}
            data-testid="blog-comment-error"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          data-testid="blog-comment-submit"
          className="px-4 py-2 text-xs font-semibold rounded-sm"
          style={{
            background: G,
            color: "#0d1117",
            fontFamily: "var(--font-mono)",
          }}
        >
          {busy ? "…" : "submit comment"}
        </button>
      </form>
    </section>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined loading, null missing
  const [relatedPosts, setRelatedPosts] = useState([]);

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

  useEffect(() => {
    if (!post) return;
    let cancelled = false;
    (async () => {
      const all = await fetchPublishedBlogs();
      if (cancelled) return;
      const tags = new Set(post.tags || []);
      const scored = all
        .filter((p) => p.slug !== post.slug)
        .map((p) => ({
          post: p,
          overlap: (p.tags || []).filter((t) => tags.has(t)).length,
        }))
        .sort((a, b) => b.overlap - a.overlap);
      setRelatedPosts(scored.slice(0, 2).map((s) => s.post));
    })();
    return () => {
      cancelled = true;
    };
  }, [post]);

  if (post === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ paddingTop: 80 }}
        data-testid="blog-post-loading"
      >
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
        <div
          className="text-5xl mb-4"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          404
        </div>
        <p className="mb-6" style={{ color: DIM }}>
          Post not found.
        </p>
        <Link
          to="/blog"
          className="text-sm"
          style={{ color: G }}
          data-testid="blog-post-back"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const canonical = `https://softogram.in/blog/${post.slug}`;
  const articleLd = {
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
      logo: {
        "@type": "ImageObject",
        url: "https://softogram.in/softogram-logo.png",
      },
    },
    mainEntityOfPage: canonical,
  };

  // A top-level array is valid JSON-LD, so the post keeps its BlogPosting markup
  // and gains a breadcrumb trail in the same <script> (issue #79).
  const jsonLd = [
    breadcrumbLd([
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    articleLd,
  ];

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

      <div
        className="relative h-64 md:h-96 overflow-hidden"
        style={{ background: "#010409" }}
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,7,13,0.3) 0%, #0d1117 100%)",
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-28">
        <div
          className="pt-10 pb-8"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
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
          <div
            className="text-xs mb-6"
            style={{ color: DIM, fontFamily: "var(--font-mono)" }}
          >
            {post.author} · {post.date} · {post.readTime || 5} min
          </div>
          <ShareRow post={post} canonical={canonical} />
        </div>

        <article className="pt-10 space-y-3" data-testid="blog-post-content">
          <ReactMarkdown components={MARKDOWN_COMPONENTS}>
            {post.content || ""}
          </ReactMarkdown>
        </article>

        <div
          className="mt-10 rounded-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ background: CARD, border: `1px solid ${G}33` }}
          data-testid="blog-post-cta"
        >
          <div>
            <div
              className="text-sm font-semibold mb-1"
              style={{ color: "#e2e8f0" }}
            >
              Need something like this built?
            </div>
            <p className="text-xs" style={{ color: DIM }}>
              Talk to us about your project - no obligation, just a
              conversation.
            </p>
          </div>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => capture("blog_cta_clicked", { slug: post.slug })}
            className="px-5 py-2.5 text-sm font-semibold text-center rounded-sm whitespace-nowrap transition-all duration-200 hover:opacity-90"
            style={{
              background: G,
              color: "#0d1117",
              fontFamily: "var(--font-mono)",
            }}
            data-testid="blog-post-cta-button"
          >
            book a call →
          </a>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-10" data-testid="blog-related-posts">
            <div
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              Related posts
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="block rounded-sm p-4 transition-all duration-200 hover:opacity-90"
                  style={{ background: CARD, border: `1px solid ${BORDER}` }}
                  data-testid="blog-related-post-card"
                >
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: "#e2e8f0" }}
                  >
                    {p.title}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: DIM }}>
                    {p.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CommentsSection slug={post.slug} />
      </div>
    </div>
  );
}
