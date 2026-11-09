/** Piece 2: live numbers, straight from the backend. Nothing here is typed by hand. */
import React from "react";
import { BATCH } from "@/data/upsolve";
import { G, A, DIM, TEXT, BORDER, DISPLAY, MONO, rupees } from "./shared";

function Tile({ value, suffix, label, color = TEXT, testId, live }) {
  return (
    <div className="flex flex-col gap-1" data-testid={testId}>
      <span className="text-[34px] font-bold leading-none" style={{ color, fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums" }}>
        {value}
        {suffix && (
          <span className="text-lg" style={{ color: DIM }}>
            {" "}
            {suffix}
          </span>
        )}
      </span>
      <span className="text-[13px] flex items-center gap-2 flex-wrap" style={{ color: DIM }}>
        {label}
        {live && (
          <span className="text-[10px] px-1.5 rounded-full" style={{ color: G, border: `1px solid ${G}66`, fontFamily: MONO }}>
            live
          </span>
        )}
      </span>
    </div>
  );
}

function daysTile(next) {
  if (!next) return { value: "Soon", label: "next demo date, on WhatsApp" };
  if (next.daysLeft === 0) return { value: "Today", label: "is the next demo" };
  if (next.daysLeft === 1) return { value: "Tomorrow", label: "is the next demo" };
  return { value: next.daysLeft, suffix: "days", label: "to the next demo" };
}

export default function Counters({ stats }) {
  // Height is reserved so the page does not jump when the numbers arrive. If the
  // backend is unreachable the bar stays empty rather than showing a guess.
  const frame = "max-w-[1120px] mx-auto rounded-lg px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-5 min-h-[104px]";
  const frameStyle = { background: "#09090e", border: `1px solid ${BORDER}` };
  if (!stats) {
    return (
      <section className="px-4 md:px-6 pb-10" style={{ background: "#0d1117" }} aria-hidden="true">
        <div className={frame} style={frameStyle} data-testid="upsolve-counters-loading" />
      </section>
    );
  }
  const bookings = stats.demoBookings;
  const days = daysTile(stats.nextDemo);
  return (
    <section className="px-4 md:px-6 pb-10" style={{ background: "#0d1117" }} aria-label="Live numbers">
      <div className={frame} style={frameStyle} data-testid="upsolve-counters">
        <Tile testId="upsolve-counter-bookings" color={G} value={bookings > 0 ? bookings : "Open"} label={bookings > 0 ? "students booked the demo" : "demo seats, be the first to book"} />
        <Tile testId="upsolve-counter-seats" color={A} value={stats.seatsTaken} suffix={`of ${stats.seatsTotal}`} label="batch seats taken" />
        {stats.earlyBirdLeft > 0 ? (
          <Tile testId="upsolve-counter-early" value={stats.earlyBirdLeft} suffix={`of ${stats.earlyBirdTotal}`} label={`early-bird seats left at ${rupees(BATCH.earlyRupees)}`} />
        ) : (
          <Tile testId="upsolve-counter-early" value="Over" label="early-bird price has ended" />
        )}
        <Tile testId="upsolve-counter-days" {...days} live />
      </div>
    </section>
  );
}
