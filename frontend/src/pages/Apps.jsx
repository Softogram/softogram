/**
 * /apps: every store link on one page, with nothing to click first.
 * X and LinkedIn have one website field each, so they point here. Keep this path.
 * The links come from data/products.js, the same place the Products page reads them.
 */
import React from "react";
import { Link } from "react-router-dom";
import { PRODUCTS } from "@/data/products";
import { G, DIM, BORDER, CARD } from "@/components/redesign/homePrimitives";
import SeoHead from "@/components/redesign/SeoHead";
import StoreBadges from "@/components/redesign/StoreBadges";
import { metaFor } from "@/lib/routeMeta";

const APPS = PRODUCTS.filter((p) => p.stores);

export default function Apps() {
  return (
    <>
      <SeoHead {...metaFor("/apps")} />
      <div className="min-h-screen" data-testid="apps-page">
        <section className="pt-32 pb-10 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
            >
              Get our{" "}
              <span className="italic" style={{ color: G }}>
                apps
              </span>
            </h1>
            <p className="text-lg" style={{ color: DIM, fontWeight: 300 }}>
              Our mobile apps, with their store links.
            </p>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-6 pb-12 space-y-6">
          {APPS.map((app) => (
            <div
              key={app.id}
              className="rounded-sm p-6"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
              data-testid={`apps-card-${app.id}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={app.img}
                  alt=""
                  className={`w-14 h-14 rounded-sm flex-shrink-0 ${app.imgFit === "contain" ? "object-contain" : "object-cover"}`}
                />
                <div className="min-w-0">
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
                  >
                    {app.name}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: DIM, fontFamily: "var(--font-mono)" }}
                  >
                    {app.category}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: DIM }}>
                {app.desc}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StoreBadges product={app} testIdPrefix={`apps-${app.id}`} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm px-6 pb-28">
          <Link
            to="/"
            className="transition-opacity hover:opacity-80"
            style={{ color: G }}
            data-testid="apps-home-link"
          >
            Looking for Softogram's software work? Go to the home page →
          </Link>
        </p>
      </div>
    </>
  );
}
