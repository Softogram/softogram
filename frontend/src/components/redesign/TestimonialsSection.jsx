/** Testimonials strip for home conversion (issue #16). */
import React from "react";
import { TESTIMONIALS } from "@/data/testimonials";
import { G, DIM, BORDER, CARD, GutterRow, Reveal } from "@/components/redesign/homePrimitives";

export default function TestimonialsSection({ startLine = 90 }) {
  let ln = startLine;
  return (
    <section data-testid="testimonials-section" className="py-16">
      <GutterRow lineNum={ln++}>
        <Reveal>
          <p className="text-xs mb-2" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
            // clients
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
          >
            Named proof, not initials
          </h2>
        </Reveal>
      </GutterRow>
      <div className="grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t) => (
          <GutterRow key={t.id} lineNum={ln++}>
            <Reveal>
              <blockquote
                className="h-full rounded-sm p-5 flex flex-col gap-3"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                data-testid="testimonial-card"
              >
                <p className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>
                  “{t.quote}”
                </p>
                <p className="text-xs" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                  {t.metric}
                </p>
                <footer className="mt-auto text-xs" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "#e2e8f0" }}>{t.name}</span>
                  <br />
                  {t.role}, {t.company}
                </footer>
              </blockquote>
            </Reveal>
          </GutterRow>
        ))}
      </div>
    </section>
  );
}
