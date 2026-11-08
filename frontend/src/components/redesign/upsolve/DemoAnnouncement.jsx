/** Piece 3: the demo class as an announcement, not a box. */
import React from "react";
import { DEMO_AGENDA, FALLBACK_DEMOS, WHATSAPP_DEMO_HREF } from "@/data/upsolve";
import { G, A, DIM, TEXT, CARD, BORDER, INK, MONO, DISPLAY, Eyebrow, WhatsAppLink, demosFrom } from "./shared";

/** "Sunday 22 November, 6 pm" becomes ["Sunday", "22 November", "6 pm"]. */
function splitLabel(label) {
  const [dayPart, time] = label.split(", ");
  const firstSpace = dayPart.indexOf(" ");
  return [dayPart.slice(0, firstSpace), dayPart.slice(firstSpace + 1), time];
}

export default function DemoAnnouncement({ stats }) {
  const demos = demosFrom(stats, FALLBACK_DEMOS);
  const [first, ...others] = demos;
  const [day, date, time] = first ? splitLabel(first.label) : [];
  return (
    <section id="demo" className="py-14 px-4 md:px-6 scroll-mt-20" style={{ background: INK, borderTop: `1px solid ${A}59`, borderBottom: `1px solid ${A}59` }} aria-label="Free demo class" data-testid="upsolve-demo">
      <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2.5 text-xs tracking-[0.18em] uppercase mb-4" style={{ color: A, fontFamily: MONO }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: A, boxShadow: `0 0 0 4px ${A}40` }} aria-hidden="true" />
            Announcement . free demo class
          </div>
          {first ? (
            <h2 className="text-5xl md:text-[64px] font-bold leading-[0.98] tracking-[-0.02em]" style={{ color: A, fontFamily: DISPLAY }} data-testid="upsolve-demo-date">
              {day}
              <br />
              {date}
              <br />
              <span style={{ color: TEXT }}>{time}</span>
            </h2>
          ) : (
            <h2 className="text-5xl font-bold leading-tight" style={{ color: A, fontFamily: DISPLAY }} data-testid="upsolve-demo-date">
              Next demo date coming soon
            </h2>
          )}
          <p className="mt-3.5 mb-5 text-sm" style={{ color: DIM, fontFamily: MONO }}>
            Online on Google Meet . 60 minutes . free
            {others.length > 0 && ` . also ${others.map((d) => d.label).join(", and ")}`}
          </p>
          <p className="text-lg leading-relaxed mb-6 max-w-[520px]" style={{ color: TEXT }}>
            One real interview problem, solved live, thinking aloud, with you. Then ask anything: about the batch, about placements, about how to prepare if you do not join.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#book" className="inline-flex items-center px-6 py-3.5 rounded-sm text-[15px] font-medium no-underline min-h-[48px]" style={{ background: A, color: INK, fontFamily: MONO }} data-testid="upsolve-demo-book">
              Book my demo seat
            </a>
            <WhatsAppLink href={WHATSAPP_DEMO_HREF} testId="upsolve-whatsapp-demo">
              Ask on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
        <div className="min-w-0 rounded-lg p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <Eyebrow className="mb-4">What happens in the hour</Eyebrow>
          <ol className="flex flex-col gap-3.5 list-none p-0 m-0">
            {DEMO_AGENDA.map((a) => (
              <li key={a.time} className="flex gap-3.5">
                <span className="text-[13px] w-14 shrink-0 pt-0.5" style={{ color: A, fontFamily: MONO }}>
                  {a.time}
                </span>
                <div>
                  <p className="font-semibold text-[15px]" style={{ color: TEXT }}>
                    {a.title}
                  </p>
                  <p className="text-sm leading-normal" style={{ color: DIM }}>
                    {a.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-3.5 flex gap-2 flex-wrap" style={{ borderTop: `1px solid ${BORDER}` }}>
            {["Bring a laptop", "C++, Java or Python", "Recording shared after"].map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-sm" style={{ color: DIM, border: `1px solid ${BORDER}`, fontFamily: MONO }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
