/** Piece 10: the closing ask, with the live numbers beside it. */
import React from "react";
import LogoMono from "@/components/redesign/LogoMono";
import { WHATSAPP_DEMO_HREF, PHONE_DISPLAY } from "@/data/upsolve";
import { G, A, DIM, TEXT, CARD, BORDER, INK, MONO, Eyebrow, Heading, WhatsAppLink } from "./shared";

function Row({ label, value, color = TEXT, last }) {
  return (
    <div className="flex justify-between gap-3 pb-2" style={last ? undefined : { borderBottom: `1px solid ${BORDER}` }}>
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

export default function FinalCta({ stats }) {
  const next = stats?.nextDemo;
  const seatsTotal = stats?.seatsTotal ?? 10;
  return (
    <section className="py-16 md:py-[72px] px-4 md:px-6" style={{ background: INK, borderTop: `1px solid ${A}59` }} aria-label="Next step" data-testid="upsolve-final">
      <div className="max-w-[1120px] mx-auto flex gap-10 flex-wrap items-center">
        <div className="flex-1 basis-[520px] min-w-0">
          <Eyebrow color={A}>Next step</Eyebrow>
          <Heading className="text-3xl md:text-[44px] mb-3.5">{next ? `Come to the free demo on ${next.label.split(",")[0]}. Decide after.` : "Come to the free demo. Decide after."}</Heading>
          <p className="text-base leading-relaxed mb-6 max-w-[560px]" style={{ color: DIM }}>
            Book a seat with the form, or message on WhatsApp with your name, college and year. You get the Meet link within a day. The batch is confirmed when 5 students have paid, and seats stop at {seatsTotal}.
          </p>
          <div className="flex gap-3 flex-wrap mb-7">
            <a href="#book" className="inline-flex items-center px-6 py-3.5 rounded-sm text-[15px] font-medium no-underline min-h-[48px]" style={{ background: A, color: INK, fontFamily: MONO }} data-testid="upsolve-final-book">
              Book my demo seat
            </a>
            <WhatsAppLink href={WHATSAPP_DEMO_HREF} testId="upsolve-whatsapp-final">
              WhatsApp {PHONE_DISPLAY}
            </WhatsAppLink>
          </div>
          <p className="inline-flex items-center gap-2.5 text-xs" style={{ color: DIM, fontFamily: MONO }} data-testid="upsolve-by-softogram">
            <LogoMono size={18} glow={false} />
            Upsolve is a Softogram initiative. Softogram is a brand of Opengram Labs Private Limited.
          </p>
        </div>
        {stats && (
          <div className="basis-[360px] grow lg:grow-0 rounded-lg p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }} data-testid="upsolve-final-stats">
            <Eyebrow>Where things stand</Eyebrow>
            <div className="flex flex-col gap-2.5 text-sm" style={{ color: "#d1d5db", fontVariantNumeric: "tabular-nums" }}>
              <Row label="Demo seats booked" value={stats.demoBookings} color={G} />
              <Row label="Batch seats taken" value={`${stats.seatsTaken} of ${stats.seatsTotal}`} color={A} />
              <Row label="Early-bird seats left" value={`${stats.earlyBirdLeft} of ${stats.earlyBirdTotal}`} />
              <Row label="Next demo" value={next ? (next.daysLeft === 0 ? "today" : `in ${next.daysLeft} day${next.daysLeft === 1 ? "" : "s"}`) : "date soon"} last />
            </div>
            <p className="mt-3 text-[11px]" style={{ color: DIM, fontFamily: MONO }}>
              Live numbers. Updated as bookings and payments come in.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
