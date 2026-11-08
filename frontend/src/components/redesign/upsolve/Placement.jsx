/** Piece 8: what off-campus support actually is, week by week. */
import React from "react";
import { PLACEMENT_STEPS } from "@/data/upsolve";
import { G, A, DIM, CARD, BORDER, MONO, Eyebrow, Heading } from "./shared";

export default function Placement() {
  return (
    <section id="placement" className="py-16 px-4 md:px-6 scroll-mt-20" style={{ background: "#0d1117", borderTop: `1px solid ${BORDER}` }} aria-label="Off-campus placement support" data-testid="upsolve-placement">
      <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-12 items-start">
        <div className="min-w-0">
          <Eyebrow>Off-campus placement support</Eyebrow>
          <Heading className="text-3xl md:text-[38px] mb-3.5">Tier-3 colleges get few campus drives. So we work the off-campus route, every week.</Heading>
          <p className="text-[15px] leading-relaxed mb-5" style={{ color: DIM }}>
            Off-campus means a company hiring through its own website, a recruiter's post, or an employee's referral, not through your college. If your college gets few drives, this is your main route, and almost nobody teaches it.
          </p>
          <div className="pl-4" style={{ borderLeft: `2px solid ${A}` }} data-testid="upsolve-no-guarantee">
            <p className="text-[15px] leading-relaxed" style={{ color: "#d1d5db" }}>
              <strong style={{ color: A }}>No placement guarantee.</strong> This batch has not run before, so there are no past results to show you yet. When there are, they will be on this page with the student's permission, and never invented.
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2.5 list-none p-0 m-0 min-w-0" data-testid="upsolve-placement-list">
          {PLACEMENT_STEPS.map((s) => (
            <li key={s.when} className="grid sm:grid-cols-[110px_1fr] gap-1 sm:gap-4 rounded-md px-4 py-3.5" style={{ background: CARD, border: `1px solid ${s.accent ? `${A}59` : BORDER}` }}>
              <span className="text-[13px] pt-0.5" style={{ color: s.accent ? A : G, fontFamily: MONO }}>
                {s.when}
              </span>
              <span className="text-[15px] leading-normal" style={{ color: "#d1d5db" }}>
                {s.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
