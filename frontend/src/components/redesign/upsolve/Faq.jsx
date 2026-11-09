/** Piece 9: plain answers. */
import React from "react";
import { FAQ } from "@/data/upsolve";
import { DIM, TEXT, CARD, BORDER, Eyebrow, Heading } from "./shared";

export default function Faq() {
  return (
    <section id="faq" className="py-16 px-4 md:px-6 scroll-mt-20" style={{ background: "#0d1117", borderTop: `1px solid ${BORDER}` }} aria-label="Questions" data-testid="upsolve-faq">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>Questions</Eyebrow>
        <Heading className="text-3xl md:text-[38px] mb-6">Plain answers</Heading>
        <dl className="grid md:grid-cols-2 gap-3.5 m-0" data-testid="upsolve-faq-list">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-md p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <dt className="font-semibold text-base mb-2" style={{ color: TEXT }}>
                {q}
              </dt>
              <dd className="m-0 text-sm leading-relaxed" style={{ color: DIM }}>
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
