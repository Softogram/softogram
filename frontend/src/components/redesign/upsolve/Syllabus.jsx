/** Piece 5: three phases, named problems. */
import React from "react";
import { PHASES, SYLLABUS_TILES } from "@/data/upsolve";
import { G, A, DIM, TEXT, CARD, BORDER, INK, MONO, DISPLAY, Eyebrow, Heading } from "./shared";

export default function Syllabus() {
  return (
    <section id="syllabus" className="py-16 px-4 md:px-6 scroll-mt-20" style={{ background: "#0d1117", borderTop: `1px solid ${BORDER}` }} aria-label="Syllabus" data-testid="upsolve-syllabus">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex justify-between items-end gap-6 flex-wrap mb-8">
          <div className="max-w-[720px]">
            <Eyebrow>Syllabus . 12 weeks . 30 Nov to 20 Feb</Eyebrow>
            <Heading className="text-3xl md:text-[40px] mb-0">Three phases, 150+ problems, every pattern an interview asks for.</Heading>
          </div>
          <p className="text-sm max-w-[320px] leading-normal" style={{ color: DIM }}>
            Each week: the idea Mon and Tue, practice Wed and Thu, hard mixed problems Fri, contest Sat, upsolve Sun.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {PHASES.map((p) => {
            const color = p.accent ? A : G;
            return (
              <div key={p.label} className="rounded-lg p-5" style={{ background: CARD, border: `1px solid ${p.accent ? `${A}59` : BORDER}` }} data-testid="upsolve-phase">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs" style={{ color, fontFamily: MONO }}>
                    {p.label}
                  </span>
                  <span className="text-[11px]" style={{ color: DIM, fontFamily: MONO }}>
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-[22px] font-bold mb-3.5" style={{ color: TEXT, fontFamily: DISPLAY }}>
                  {p.title}
                </h3>
                <ol className="flex flex-col gap-2.5 list-none p-0 m-0">
                  {p.weeks.map((w) => (
                    <li key={w.n} className="flex gap-2.5 text-sm" data-testid="upsolve-week">
                      <span className="w-[22px] shrink-0" style={{ color, fontFamily: MONO }}>
                        {String(w.n).padStart(2, "0")}
                      </span>
                      <div>
                        <p style={{ color: TEXT }}>{w.topic}</p>
                        <p className="text-xs" style={{ color: DIM }}>
                          {w.problems}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SYLLABUS_TILES.map((t) => (
            <div key={t.text} className="rounded-md px-4 py-4" style={{ background: INK, border: `1px solid ${BORDER}` }}>
              <p className="text-[26px] font-bold leading-none" style={{ color: G, fontFamily: DISPLAY }}>
                {t.value}
              </p>
              <p className="text-[13px] mt-1" style={{ color: DIM }}>
                {t.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px]" style={{ color: DIM }}>
          Languages: C++ in class by default. Java and Python students code in their own language. Not covered: system design, OS, DBMS, web development. Those are a different course.
        </p>
      </div>
    </section>
  );
}
