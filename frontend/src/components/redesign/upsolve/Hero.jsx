/** Piece 1: headline, the Prayagraj promise, and the booking form. */
import React from "react";
import { ChevronRight, MapPin } from "lucide-react";
import UpsolveMark from "@/components/redesign/UpsolveMark";
import { HERO_CHIPS, HERO_POINTS } from "@/data/upsolve";
import BookingForm from "./BookingForm";
import { G, A, DIM, TEXT, BODY, INK, MONO, DISPLAY, Tick, daysPhrase } from "./shared";

function DemoPill({ stats }) {
  const next = stats?.nextDemo;
  const text = !stats
    ? "FREE DEMO CLASS . online . no payment"
    : next
      ? `FREE DEMO CLASS . ${next.label} . ${daysPhrase(next.daysLeft)}`
      : "FREE DEMO CLASS . next date on WhatsApp";
  return (
    <a href="#demo" className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 mb-5 min-h-[44px] text-[13px] no-underline" style={{ background: `${A}1f`, border: `1px solid ${A}80`, color: A, fontFamily: MONO }} data-testid="upsolve-demo-pill">
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: A }} />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: A }} />
      </span>
      {text}
      <ChevronRight size={14} aria-hidden="true" className="shrink-0" />
    </a>
  );
}

export default function Hero({ stats, onBooked }) {
  return (
    <section className="pt-28 md:pt-32 pb-12 px-4 md:px-6" style={{ background: "#0d1117" }} data-testid="upsolve-hero">
      <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 lg:gap-12 items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-6" data-testid="upsolve-brand">
            <UpsolveMark size={44} />
            <div>
              <p className="text-2xl font-bold leading-none" style={{ color: TEXT, fontFamily: DISPLAY }}>
                Upsolve
              </p>
              <p className="text-xs mt-1" style={{ color: DIM, fontFamily: MONO }}>
                by Softogram
              </p>
            </div>
          </div>
          <DemoPill stats={stats} />
          <h1 className="text-4xl md:text-[56px] font-bold leading-[1.05] tracking-[-0.01em] mb-5" style={{ color: TEXT, fontFamily: DISPLAY }} data-testid="upsolve-hero-title">
            Crack coding interviews with a coach <span style={{ color: G }}>watching your code.</span>
          </h1>
          <p className="text-lg md:text-[19px] leading-relaxed mb-6 max-w-[540px]" style={{ color: BODY }}>
            DSA (data structures and algorithms) is a skill, not a subject. You do not learn it from a 12-hour video you never finish. You learn it by solving 150+ problems live, with someone checking every line and asking "why".
          </p>
          {/* On a phone the form sits below all of this, and that is where the QR code lands. */}
          <a href="#book" className="lg:hidden inline-flex items-center justify-center w-full rounded-sm text-[15px] font-medium px-5 py-3 min-h-[48px] mb-6 no-underline" style={{ background: G, color: INK, fontFamily: MONO }} data-testid="upsolve-hero-book">
            Book my free demo seat
          </a>
          <ul className="flex flex-col gap-2.5 mb-6 text-[15px] list-none p-0" style={{ color: "#d1d5db" }}>
            {HERO_POINTS.map((p) => (
              <li key={p} className="flex gap-2.5 items-start">
                <Tick />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3.5 items-start rounded-md px-4 py-3.5 mb-6" style={{ background: `${A}1a`, border: `1px solid ${A}8c`, borderLeft: `4px solid ${A}` }} data-testid="upsolve-prayagraj-callout">
            <MapPin size={22} color={A} aria-hidden="true" className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-base mb-1" style={{ color: A }}>
                Your coach is from Prayagraj, not a face on a video.
              </p>
              <p className="text-[14.5px] leading-normal" style={{ color: TEXT }}>
                We meet in person at batch meetups in Prayagraj. And I personally work your job search with you: referrals from my own network, your resume, your interviews.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {HERO_CHIPS.map((c) => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-sm" style={{ color: G, background: `${G}1f`, border: `1px solid ${G}4d`, fontFamily: MONO }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <BookingForm stats={stats} onBooked={onBooked} />
      </div>
    </section>
  );
}
