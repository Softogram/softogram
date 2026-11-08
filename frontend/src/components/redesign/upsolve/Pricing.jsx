/** Piece 6: the fee, what it buys, how to pay, and the school batch. */
import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { BATCH, COLLECTED_BY, GUARANTEE, INCLUDED, REFUND_RULE, SCHOOL, WHATSAPP_PAYMENT_HREF, WHATSAPP_SCHOOL_HREF } from "@/data/upsolve";
import { G, A, DIM, TEXT, CARD, BORDER, INK, MONO, DISPLAY, SANS, Eyebrow, Heading, Tick, WhatsAppLink, rupees } from "./shared";

export default function Pricing({ stats }) {
  const full = stats?.fees?.fullRupees ?? BATCH.fullRupees;
  const early = stats?.fees?.earlyRupees ?? BATCH.earlyRupees;
  const batchFull = stats ? stats.seatsLeft === 0 : false;
  const earlyOver = stats ? stats.earlyBirdLeft === 0 : false;
  return (
    <section id="pricing" className="py-16 px-4 md:px-6 scroll-mt-20" style={{ background: INK, borderTop: `1px solid ${BORDER}` }} aria-label="Pricing" data-testid="upsolve-pricing">
      <div className="max-w-[1120px] mx-auto">
        <Eyebrow>Pricing</Eyebrow>
        <Heading className="text-3xl md:text-[40px] mb-2.5">One fee. Everything included. Nothing to pay at the demo.</Heading>
        <p className="text-base leading-normal mb-8 max-w-[640px]" style={{ color: DIM }}>
          Enrol when you are ready, here on the site or through a payment link on WhatsApp. A recorded course is cheaper, and nobody checks your code. That is the trade.
        </p>
        <div className="grid lg:grid-cols-[3fr_2fr] gap-5 items-stretch">
          <div className="relative rounded-xl p-6 md:p-7 min-w-0" style={{ background: CARD, border: `1px solid ${G}80` }} data-testid="upsolve-fee-card">
            <span className="absolute -top-3 left-6 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: G, color: INK, fontFamily: MONO }}>
              COLLEGE BATCH . STARTS 30 NOV
            </span>
            <div className="grid md:grid-cols-2 gap-7 mt-2">
              <div className="min-w-0">
                <p className="text-5xl md:text-[52px] font-bold leading-none mb-1.5" style={{ color: G, fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums" }}>
                  {rupees(full)}
                </p>
                <p className="text-[15px] mb-4" style={{ color: TEXT }}>
                  for the full 12 weeks. That is {rupees(full / 3)} a month, or about {rupees(Math.round(full / 120))} per class hour.
                </p>
                {!earlyOver && (
                  <div className="rounded-md px-3.5 py-3 mb-3.5" style={{ background: `${A}1a`, border: `1px solid ${A}73` }} data-testid="upsolve-early-box">
                    <p className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] px-1.5 py-0.5 rounded-sm" style={{ background: A, color: INK, fontFamily: MONO }}>
                        EARLY BIRD
                      </span>
                      <span className="font-semibold text-base" style={{ color: TEXT }}>
                        {rupees(early)} for the first {BATCH.earlyTotal} students
                      </span>
                    </p>
                    {stats && (
                      <p className="text-[13px]" style={{ color: "#c9d1d9", fontVariantNumeric: "tabular-nums" }}>
                        {stats.earlyBirdLeft} of {stats.earlyBirdTotal} early-bird seats left
                      </p>
                    )}
                  </div>
                )}
                <p className="text-sm leading-normal mb-3.5" style={{ color: DIM }} data-testid="upsolve-refund">
                  Two instalments allowed: half now, half before week 7. {REFUND_RULE}
                </p>
                <div className="rounded-md px-3.5 py-3" style={{ background: INK, border: `1px solid ${BORDER}` }} data-testid="upsolve-how-to-pay">
                  <Eyebrow className="mb-1.5">How to pay</Eyebrow>
                  <p className="text-[13px] leading-normal" style={{ color: "#c9d1d9" }}>
                    Pay on this site through Razorpay: UPI, card, net banking or wallet. Card details never touch softogram.in. Receipt by email within a minute. {COLLECTED_BY}
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex flex-col">
                <p className="text-xs mb-2.5" style={{ color: G, fontFamily: MONO }}>
                  Included
                </p>
                <ul className="flex flex-col gap-2 text-sm list-none p-0 m-0" style={{ color: "#d1d5db" }}>
                  {INCLUDED.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Tick size={16} />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-md px-3.5 py-3" style={{ border: `1px solid ${BORDER}` }} data-testid="upsolve-guarantee">
                  <Eyebrow className="mb-1.5" color={A}>
                    The Upsolve guarantee
                  </Eyebrow>
                  <p className="text-[13px] leading-normal" style={{ color: "#c9d1d9" }}>
                    {GUARANTEE}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex flex-col gap-2">
                  {batchFull ? (
                    <p className="text-sm font-semibold text-center py-3 rounded-sm" style={{ color: A, border: `1px solid ${A}73` }} data-testid="upsolve-batch-full">
                      This batch is full. Ask on WhatsApp for the waitlist.
                    </p>
                  ) : (
                    <Link to="/upsolve/enrol" className="inline-flex items-center justify-center gap-2 w-full rounded-sm text-sm font-medium px-4 py-3 min-h-[46px] no-underline" style={{ background: G, color: INK, fontFamily: MONO }} data-testid="upsolve-enrol-link">
                      <Lock size={14} aria-hidden="true" />
                      Enrol and pay now
                    </Link>
                  )}
                  <a href="#book" className="inline-flex items-center justify-center text-center w-full rounded-sm text-sm font-medium px-4 py-3 min-h-[46px] no-underline" style={{ border: `1px solid ${G}66`, color: TEXT, fontFamily: MONO }}>
                    Not sure? Book the free demo first
                  </a>
                  <WhatsAppLink href={WHATSAPP_PAYMENT_HREF} testId="upsolve-whatsapp-payment">
                    Get a payment link on WhatsApp
                  </WhatsAppLink>
                </div>
              </div>
            </div>
          </div>
          <div id="school" className="rounded-xl p-6 md:p-7 flex flex-col min-w-0" style={{ background: CARD, border: `1px solid ${BORDER}` }} data-testid="upsolve-school-card">
            <span className="text-[11px] mb-3.5" style={{ color: DIM, fontFamily: MONO }}>
              SCHOOL BATCH . CLASSES 8 TO 12 . OPENS AT 6 REGISTRATIONS
            </span>
            <p className="text-[40px] font-bold leading-none mb-3" style={{ color: TEXT, fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums" }}>
              Rs 3,000{" "}
              <span className="text-[15px] font-medium" style={{ color: DIM, fontFamily: SANS }}>
                per month
              </span>
            </p>
            <p className="text-base mb-3" style={{ color: TEXT }}>
              Coding seekhiye, soch tez kijiye.
            </p>
            <ul className="flex flex-col gap-2 text-sm list-none p-0 mb-3.5" style={{ color: "#d1d5db" }}>
              {SCHOOL.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <Tick size={16} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm leading-normal mb-2" style={{ color: DIM }}>
              {SCHOOL.schedule}
            </p>
            <p className="text-sm leading-normal mb-4" style={{ color: DIM }}>
              {SCHOOL.refund}
            </p>
            <div className="mt-auto">
              <WhatsAppLink href={WHATSAPP_SCHOOL_HREF} testId="upsolve-whatsapp-school">
                WhatsApp about school classes
              </WhatsAppLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
