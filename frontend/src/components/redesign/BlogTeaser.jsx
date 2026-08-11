/** Homepage "latest from the blog" teaser (issue #76). Surfaces real post content
 * that was otherwise only reachable via a nav click. */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublishedBlogs } from "@/lib/cmsApi";
import { G, DIM, BORDER, CARD, Section, Reveal } from "./homePrimitives";

export default function BlogTeaserSection() {
  const [post, setPost] = useState(undefined); // undefined = loading, null = none available

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const posts = await fetchPublishedBlogs();
      if (!cancelled) setPost(posts[0] || null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!post) return null;

  return (
    <Section id="blog-teaser" testId="blog-teaser-section" className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              From the blog
            </span>
            <Link
              to="/blog"
              className="text-xs transition-colors duration-150"
              style={{ color: DIM, fontFamily: "var(--font-mono)" }}
              data-testid="blog-teaser-all-link"
            >
              all posts →
            </Link>
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="block rounded-sm p-6 md:p-8 transition-all duration-200 hover:opacity-90"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
            data-testid="blog-teaser-card"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {(post.tags || []).slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-sm"
                  style={{
                    color: G,
                    border: `1px solid ${G}33`,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <h3
              className="text-xl md:text-2xl font-bold mb-2"
              style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: DIM }}>
              {post.excerpt}
            </p>
            <span
              className="text-xs"
              style={{ color: DIM, fontFamily: "var(--font-mono)" }}
            >
              {post.author} · {post.date} · {post.readTime || 5} min read
            </span>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
