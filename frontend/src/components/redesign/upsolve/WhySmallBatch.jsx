/** Piece 4: why ten students, and why that matters for DSA specifically. */
import React from "react";
import { Clock, LineChart, MonitorCheck, Users } from "lucide-react";
import { CLASS_TIMELINE, WHY_CARDS } from "@/data/upsolve";
import { G, DIM, TEXT, CARD, BORDER, INK, MONO, Eyebrow, Heading } from "./shared";

const ICONS = { screen: MonitorCheck, clock: Clock, chart: LineChart, people: Users };

export default function WhySmallBatch() {
  return (
    <section className="py-16 px-4 md:px-6" style={{ background: "#0d1117" }} aria-label="Why a small live batch" data-testid="upsolve-why">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>Why this works for DSA</Eyebrow>
        <Heading className="text-3xl md:text-[40px] mb-3 max-w-[760px]">DSA is learned like swimming. Nobody learns it by watching.</Heading>
        <p className="text-[17px] leading-relaxed mb-8 max-w-[680px]" style={{ color: DIM }}>
          Data structures and algorithms is the one subject where knowing the idea and being able to do it under a clock are completely different things. Interviews test the second one. So does this batch.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {WHY_CARDS.map((c) => {
            const Icon = ICONS[c.icon];
            return (
              <div key={c.title} className="rounded-lg p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }} data-testid="upsolve-why-card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-lg inline-flex items-center justify-center shrink-0" style={{ background: `${G}1f` }}>
                    <Icon size={20} color={G} aria-hidden="true" />
                  </span>
                  <h3 className="text-[19px] font-semibold" style={{ color: TEXT }}>
                    {c.title}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed" style={{ color: "#c9d1d9" }}>
                  {c.text}
                </p>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg px-6 py-5" style={{ background: INK, border: `1px solid ${BORDER}` }}>
          <Eyebrow className="mb-3.5">One class, 7 to 9 pm</Eyebrow>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CLASS_TIMELINE.map((t) => (
              <div key={t.time} className="pl-3.5" style={{ borderLeft: `2px solid ${G}80` }}>
                <p className="text-[13px] mb-1" style={{ color: G, fontFamily: MONO }}>
                  {t.time}
                </p>
                <p className="font-semibold text-[15px] mb-0.5" style={{ color: TEXT }}>
                  {t.title}
                </p>
                <p className="text-[13px] leading-normal" style={{ color: DIM }}>
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
