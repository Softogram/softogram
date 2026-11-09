/** "Book a free demo seat": lands in the Upsolve bookings tab in /admin. */
import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { bookDemoSeat, apiErrorMessage } from "@/lib/upsolveApi";
import { capture } from "@/lib/analytics";
import { FALLBACK_DEMOS, PHONE_DISPLAY, WHATSAPP_DEMO_HREF } from "@/data/upsolve";
import { G, DIM, CARD, TEXT, MONO, ERROR, INK, FIELD_BORDER, Eyebrow, Field, Honeypot, WhatsAppLink, fieldStyle, isValidIndianPhone, demosFrom } from "./shared";

const YEARS = ["2nd year", "3rd year", "4th year", "School student", "Other"];
const inputClass = "h-[46px] px-3.5 rounded-sm text-base w-full";

export default function BookingForm({ stats, onBooked }) {
  const demos = demosFrom(stats, FALLBACK_DEMOS);
  const [form, setForm] = useState({ name: "", phone: "", college: "", year: YEARS[0], demo: "" });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [done, setDone] = useState(null);
  const confirmation = useRef(null);

  // The form is about two screens tall on a phone and the confirmation is much shorter,
  // so swapping one for the other leaves the student looking at a later section.
  useEffect(() => {
    if (done) confirmation.current?.scrollIntoView({ block: "center" });
  }, [done]);

  const chosenDemo = form.demo || demos[0]?.date || "";
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = "Enter your name.";
    if (!isValidIndianPhone(form.phone)) found.phone = "Enter a 10-digit WhatsApp number.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFailure("");
    try {
      const res = await bookDemoSeat({
        name: form.name.trim(),
        phone: form.phone,
        college: form.college.trim(),
        year: form.year,
        demo_date: chosenDemo,
        company_website: honeypot,
      });
      setDone({ message: res.message, label: demos.find((d) => d.date === chosenDemo)?.label || "" });
      capture("upsolve_demo_booked", { demo: chosenDemo });
      onBooked?.();
    } catch (err) {
      setFailure(apiErrorMessage(err, `Could not book the seat. WhatsApp ${PHONE_DISPLAY} and I will add you.`));
    } finally {
      setBusy(false);
    }
  };

  const panel = "w-full rounded-lg p-6 flex flex-col gap-3.5 scroll-mt-28";
  const panelStyle = { background: CARD, border: `1px solid ${G}66` };

  if (done) {
    return (
      <div id="book" ref={confirmation} className={panel} style={panelStyle} data-testid="upsolve-booking-success" role="status">
        <CheckCircle2 size={32} color={G} aria-hidden="true" />
        <h2 className="text-2xl font-bold" style={{ color: TEXT, fontFamily: "var(--font-display)" }}>
          Your seat is booked.
        </h2>
        {done.label && (
          <p className="text-base font-semibold" style={{ color: TEXT }}>
            {done.label}
          </p>
        )}
        <p className="text-sm leading-relaxed" style={{ color: DIM }}>
          {done.message} Bring a laptop and a compiler for C++, Java or Python.
        </p>
        <WhatsAppLink href={WHATSAPP_DEMO_HREF} testId="upsolve-booking-whatsapp">
          Say hello on WhatsApp
        </WhatsAppLink>
      </div>
    );
  }

  if (!demos.length) {
    return (
      <div id="book" className={panel} style={panelStyle} data-testid="upsolve-booking-closed">
        <Eyebrow className="mb-0">Free demo class</Eyebrow>
        <p className="text-base leading-relaxed" style={{ color: TEXT }}>
          The next demo date is being fixed. Message on WhatsApp and you get it first.
        </p>
        <WhatsAppLink href={WHATSAPP_DEMO_HREF} solid testId="upsolve-booking-whatsapp">
          Ask on WhatsApp
        </WhatsAppLink>
      </div>
    );
  }

  return (
    <form id="book" onSubmit={submit} noValidate className={`relative ${panel}`} style={panelStyle} aria-label="Book a free demo seat" data-testid="upsolve-booking-form">
      <div>
        <Eyebrow className="mb-1">Book a free demo seat</Eyebrow>
        <p className="text-sm leading-normal" style={{ color: DIM }}>
          One hour, online. No payment now. You get the Meet link on WhatsApp within a day.
        </p>
      </div>
      <Field id="upsolve-name" label="Your name" required error={errors.name}>
        <input id="upsolve-name" className={inputClass} style={fieldStyle} type="text" autoComplete="name" value={form.name} onChange={set("name")} data-testid="upsolve-booking-name" aria-required="true" />
      </Field>
      <Field id="upsolve-phone" label="WhatsApp number" required error={errors.phone} help="The demo link comes here. No calls unless you ask.">
        <input id="upsolve-phone" className={inputClass} style={fieldStyle} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} data-testid="upsolve-booking-phone" aria-required="true" />
      </Field>
      <div className="grid min-[420px]:grid-cols-2 gap-3">
        <Field id="upsolve-college" label="College">
          <input id="upsolve-college" className={inputClass} style={fieldStyle} type="text" autoComplete="organization" value={form.college} onChange={set("college")} data-testid="upsolve-booking-college" />
        </Field>
        <Field id="upsolve-year" label="Year">
          <select id="upsolve-year" className={inputClass} style={fieldStyle} value={form.year} onChange={set("year")} data-testid="upsolve-booking-year">
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-[13px] font-semibold mb-1.5 p-0" style={{ color: TEXT }}>
          Which demo?
        </legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {demos.map((d) => {
            const selected = chosenDemo === d.date;
            return (
              <label key={d.date} className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 min-h-[46px] text-sm cursor-pointer" style={{ border: `1px solid ${selected ? `${G}80` : FIELD_BORDER}`, background: selected ? `${G}14` : "transparent", color: TEXT }}>
                <input type="radio" name="upsolve-demo" value={d.date} checked={selected} onChange={set("demo")} data-testid={`upsolve-booking-demo-${d.date}`} style={{ accentColor: G, width: 16, height: 16 }} />
                {d.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <Honeypot value={honeypot} onChange={setHoneypot} testId="upsolve-booking-honeypot" />
      {failure && (
        <p className="text-sm" style={{ color: ERROR }} role="alert" data-testid="upsolve-booking-failure">
          {failure}
        </p>
      )}
      <button type="submit" disabled={busy} className="h-12 rounded-sm text-[15px] font-medium disabled:opacity-60 cursor-pointer" style={{ background: G, color: INK, fontFamily: MONO }} data-testid="upsolve-booking-submit">
        {busy ? "Booking your seat..." : "Book my demo seat"}
      </button>
    </form>
  );
}
