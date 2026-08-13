/**
 * Products catalog — Phase 5.
 * Static seeds only (no localStorage / admin).
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCTS, PRODUCT_REVIEWS } from "@/data/products";
import {
  G,
  A,
  DIM,
  BORDER,
  CARD,
  Reveal,
} from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";
import { metaFor } from "@/lib/routeMeta";
import { breadcrumbLd } from "@/lib/seo";

const BETA = "#38bdf8";

function statusColor(status) {
  if (status === "Live") return G;
  if (status === "Beta") return BETA;
  return A;
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < rating ? A : "rgba(255,255,255,0.15)",
            fontSize: 14,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ProductModal({ product, onClose }) {
  const reviews = PRODUCT_REVIEWS.filter(
    (r) => r.productId === product.id && r.approved,
  );
  const accent = statusColor(product.status);

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
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
      data-testid="product-modal-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm pane-scroll"
        style={{ background: CARD, border: `1px solid ${G}33` }}
        onClick={(e) => e.stopPropagation()}
        data-testid="product-modal"
      >
        <div
          className="relative h-52 overflow-hidden"
          style={{ background: "#010409" }}
        >
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 30%, ${CARD})`,
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-sm text-white transition-colors duration-200"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
            }}
            data-testid="product-modal-close"
            aria-label="Close"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-6">
            <span
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: `${G}22`,
                color: G,
                border: `1px solid ${G}44`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {product.badge}
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
                data-testid="product-modal-name"
              >
                {product.name}
              </h2>
              <span
                className="text-xs"
                style={{ color: DIM, fontFamily: "var(--font-mono)" }}
              >
                {product.category}
              </span>
            </div>
            <div>
              <div
                className="text-sm font-semibold mb-1 text-right"
                style={{ color: G, fontFamily: "var(--font-mono)" }}
              >
                {product.price}
              </div>
              <span
                className="flex items-center gap-1.5 text-xs justify-end"
                style={{ color: accent, fontFamily: "var(--font-mono)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: accent }}
                />
                {product.status}
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: DIM }}>
            {product.longDesc}
          </p>

          <div className="mb-6">
            <h4
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              Features
            </h4>
            <div
              className="grid grid-cols-1 gap-2"
              data-testid="product-modal-features"
            >
              {product.features.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#cbd5e1" }}
                >
                  <span style={{ color: G }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {reviews.length > 0 && (
            <div data-testid="product-modal-reviews">
              <h4
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: G, fontFamily: "var(--font-mono)" }}
              >
                Reviews
              </h4>
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-sm"
                    style={{
                      background: "#010409",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#e2e8f0" }}
                        >
                          {r.author}
                        </div>
                        <div className="text-xs" style={{ color: DIM }}>
                          {r.role}
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p
                      className="text-sm italic leading-relaxed"
                      style={{ color: DIM }}
                    >
                      &ldquo;{r.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Link
              to="/#contact"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-center rounded-sm transition-all duration-200 hover:opacity-90"
              style={{
                background: G,
                color: "#0d1117",
                fontFamily: "var(--font-mono)",
              }}
              data-testid="product-modal-cta"
            >
              Get started
            </Link>
            {product.link !== "#" && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-sm font-semibold rounded-sm transition-all duration-200"
                style={{
                  color: DIM,
                  border: `1px solid ${BORDER}`,
                  fontFamily: "var(--font-mono)",
                }}
                data-testid="product-modal-visit"
              >
                Visit →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function slugify(cat) {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

export default function Products() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category.split(" · ")[1]))),
  ];
  const filtered =
    filter === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category.includes(filter));

  return (
    <>
      {/*
        No Product/Offer schema here on purpose (issue #79 explicitly defers it).
        The fabricated product claims were stripped in a4353f9, and encoding
        numeric claims into structured data is exactly how they would creep back.
        BreadcrumbList carries no claims, so it is safe.
      */}
      <SeoHead
        {...metaFor("/products")}
        jsonLd={breadcrumbLd([{ name: "Products", path: "/products" }])}
      />
      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}

      <div style={{ paddingTop: 80 }} data-testid="products-page">
        <section
          className="relative py-24 overflow-hidden"
          data-testid="products-hero"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(74,222,128,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <div
              className="text-xs font-medium uppercase tracking-widest mb-5"
              style={{ color: G, fontFamily: "var(--font-mono)" }}
            >
              Open Source
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
              Tools we{" "}
              <span className="italic" style={{ color: G }}>
                build and ship.
              </span>
            </h1>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: DIM, fontWeight: 300 }}
            >
              Free, open-source tools we build for ourselves and release
              publicly - real repos, real releases.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex gap-3 flex-wrap" data-testid="products-filter">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className="px-4 py-1.5 text-xs rounded-sm transition-all duration-200"
                style={{
                  background: filter === cat ? `${G}22` : "transparent",
                  border: `1px solid ${filter === cat ? `${G}55` : BORDER}`,
                  color: filter === cat ? G : DIM,
                  fontFamily: "var(--font-mono)",
                }}
                data-testid={`products-filter-${slugify(cat)}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => {
              const accent = statusColor(p.status);
              return (
                <Reveal key={p.id} delay={i * 100}>
                  <div
                    role="button"
                    tabIndex={0}
                    className="rounded-sm overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300"
                    style={{ background: CARD, border: `1px solid ${BORDER}` }}
                    onClick={() => setSelected(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(p);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.borderColor = `${G}55`;
                      e.currentTarget.style.boxShadow = `0 24px 80px ${G}22`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.borderColor = BORDER;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    data-testid="product-card"
                    data-product-id={p.id}
                  >
                    <div
                      className="relative h-44 overflow-hidden"
                      style={{ background: "#010409" }}
                    >
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover opacity-55"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to bottom, transparent 30%, ${CARD})`,
                        }}
                      />
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-sm text-xs font-semibold"
                        style={{
                          background: "rgba(7,7,13,0.8)",
                          border: `1px solid ${G}44`,
                          color: G,
                          fontFamily: "var(--font-mono)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {p.badge}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <span
                          className="text-xs"
                          style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                        >
                          {p.category}
                        </span>
                        <span
                          className="flex items-center gap-1.5 text-xs"
                          style={{
                            color: accent,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: accent }}
                          />
                          {p.status}
                        </span>
                      </div>
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{
                          color: "#e2e8f0",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {p.name}
                      </h3>
                      <p
                        className="text-sm leading-relaxed flex-1 mb-4"
                        style={{ color: DIM }}
                      >
                        {p.desc}
                      </p>
                      <div
                        className="text-xs font-medium"
                        style={{ color: G, fontFamily: "var(--font-mono)" }}
                      >
                        {p.price}
                      </div>
                      <div
                        className="mt-4 text-xs"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        Click to explore →
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
