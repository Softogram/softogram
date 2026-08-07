/**
 * Blog index — loads from CMS API with seed fallback (issue #17).
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublishedBlogs, blogRssUrl } from "@/lib/cmsApi";
import { G, DIM, BORDER, CARD, Reveal } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchPublishedBlogs();
      if (!cancelled) {
        setPosts(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags || [])))];
  const filtered = activeTag === "All" ? posts : posts.filter((p) => (p.tags || []).includes(activeTag));
  const [featured, ...rest] = filtered;

  return (
    <div style={{ paddingTop: 80 }} data-testid="blog-page">
      <SeoHead
        title="Blog | Softogram"
        description="Engineering insights, buying guides, and launch checklists from Softogram."
        canonical="https://softogram.in/blog"
        rssUrl={blogRssUrl()}
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

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading && (
          <p className="text-sm" style={{ color: DIM, fontFamily: "var(--font-mono)" }} data-testid="blog-loading">
            loading…
          </p>
        )}
        {!loading && !featured && (
          <p style={{ color: DIM }} data-testid="blog-empty">
            No posts yet.
          </p>
        )}
        {featured && (
          <Reveal>
            <Link
              to={`/blog/${featured.slug}`}
              className="block mb-10 rounded-sm overflow-hidden"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
              data-testid="blog-featured"
            >
              <div className="grid md:grid-cols-2">
                <img src={featured.coverImage} alt="" className="h-64 w-full object-cover opacity-80" />
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-3" style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}>
                    {featured.title}
                  </h2>
                  <p className="text-sm mb-4" style={{ color: DIM }}>
                    {featured.excerpt}
                  </p>
                  <span className="text-xs" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                    read →
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((p) => (
            <Reveal key={p.id}>
              <Link
                to={`/blog/${p.slug}`}
                className="block h-full rounded-sm overflow-hidden"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                data-testid="blog-card"
              >
                <img src={p.coverImage} alt="" className="h-40 w-full object-cover opacity-70" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "#e2e8f0" }}>
                    {p.title}
                  </h3>
                  <p className="text-xs" style={{ color: DIM }}>
                    {p.excerpt}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
