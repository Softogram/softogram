/**
 * /upsolve/enrol - take a seat and pay through Razorpay.
 *
 * The page never decides a price. It asks the backend to create an order, opens
 * Razorpay's own checkout for that order, and hands the result back to the
 * backend to verify. Card details stay on Razorpay's side.
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Lock } from "lucide-react";
import SeoHead from "@/components/redesign/SeoHead";
import UpsolveMark from "@/components/redesign/UpsolveMark";
import { metaFor } from "@/lib/routeMeta";
import { capture } from "@/lib/analytics";
import { apiErrorMessage, createEnrolment, loadRazorpayCheckout, useUpsolveStats, verifyEnrolment } from "@/lib/upsolveApi";
import { BATCH, COLLECTED_BY, GUARANTEE, INCLUDED, PHONE_DISPLAY, REFUND_RULE, WHATSAPP_HELLO_HREF, WHATSAPP_PAYMENT_HREF } from "@/data/upsolve";
import { G, A, DIM, TEXT, CARD, BORDER, INK, ERROR, MONO, DISPLAY, FIELD_BORDER, Eyebrow, Field, Honeypot, WhatsAppLink, fieldStyle, isValidIndianPhone, rupees } from "@/components/redesign/upsolve/shared";

const inputClass = "h-[46px] px-3.5 rounded-sm text-base w-full";
const LANGUAGES = ["C++", "Java", "Python"];

function PlanOption({ id, value, checked, onChange, title, note, price, priceNote, accent }) {
  return (
    <label htmlFor={id} className="grid grid-cols-[24px_1fr] sm:grid-cols-[24px_1fr_auto] gap-x-3.5 gap-y-1 items-center rounded-md px-4 py-3.5 cursor-pointer" style={{ border: `1px solid ${checked ? `${accent}99` : FIELD_BORDER}`, background: checked ? `${accent}14` : "transparent" }}>
      <input id={id} type="radio" name="upsolve-plan" value={value} checked={checked} onChange={onChange} data-testid={`upsolve-plan-${value}`} style={{ accentColor: accent, width: 18, height: 18 }} />
      <span>
        <span className="block font-semibold text-base" style={{ color: TEXT }}>
          {title}
        </span>
        <span className="block text-[13px]" style={{ color: DIM }}>
          {note}
        </span>
      </span>
      <span className="col-start-2 sm:col-start-3 text-2xl font-bold" style={{ color: checked ? accent : TEXT, fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums" }}>
        {price}
        {priceNote && (
          <span className="text-[13px] font-medium" style={{ color: DIM, fontFamily: "var(--font-rd-sans)" }}>
            {" "}
            {priceNote}
          </span>
        )}
      </span>
    </label>
  );
}

function Success({ result }) {
  const next = [
    { when: "Within an hour", text: "I add you to the batch WhatsApp group and the private Codeforces group, by hand, with a hello." },
    { when: "Before 30 Nov", text: "You get the week 1 sheet, the Meet link, and a 10-minute setup guide for your compiler." },
    { when: "Monday 30 Nov, 7 pm", text: "Class 1. Camera on, laptop open. We start with complexity and arrays." },
  ];
  const plan = `${result.earlyBird ? "Early bird, " : ""}${result.plan === "full" ? "full fee" : "instalment 1 of 2"}, ${rupees(result.amountRupees)}`;
  return (
    <div className="max-w-[760px] mx-auto rounded-xl p-6 md:p-9" style={{ background: CARD, border: `1px solid ${G}80` }} data-testid="upsolve-enrol-success" role="status">
      <div className="flex items-center gap-4 mb-4">
        <CheckCircle2 size={44} color={G} aria-hidden="true" className="shrink-0" />
        <div>
          <Eyebrow className="mb-1">Payment received</Eyebrow>
          <h1 className="text-3xl md:text-[34px] font-bold leading-tight" style={{ color: TEXT, fontFamily: DISPLAY }} data-testid="upsolve-success-title">
            You are in. Seat {result.seatNumber} of {result.seatsTotal}.
          </h1>
        </div>
      </div>
      <p className="text-base leading-relaxed mb-5" style={{ color: "#c9d1d9" }}>
        {rupees(result.amountRupees)} received for the college batch starting {BATCH.startDate}. The receipt is on its way to your email. Here is what happens next.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {next.map((n) => (
          <div key={n.when} className="rounded-lg p-4" style={{ background: INK, border: `1px solid ${BORDER}` }}>
            <p className="text-xs mb-1.5" style={{ color: G, fontFamily: MONO }}>
              {n.when}
            </p>
            <p className="text-sm leading-normal" style={{ color: "#d1d5db" }}>
              {n.text}
            </p>
          </div>
        ))}
      </div>
      <dl className="flex flex-col gap-2 text-sm rounded-lg px-4 py-3.5 mb-5 m-0" style={{ background: INK, border: `1px solid ${BORDER}`, color: "#d1d5db", fontFamily: MONO }}>
        {[
          ["Receipt", result.receipt],
          ["Payment id", result.razorpayPaymentId],
          ["Plan", plan],
          ["Refund rule", "Full refund before the 3rd class"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 flex-wrap">
            <dt style={{ color: DIM }}>{k}</dt>
            <dd className="m-0" data-testid={`upsolve-success-${k.toLowerCase().replace(" ", "-")}`}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <WhatsAppLink href={WHATSAPP_HELLO_HREF} solid testId="upsolve-success-whatsapp">
        Say hello on WhatsApp
      </WhatsAppLink>
    </div>
  );
}

export default function UpsolveEnrol() {
  const { stats, refresh } = useUpsolveStats();
  const [form, setForm] = useState({ name: "", phone: "", email: "", college: "", language: "C++", plan: "full", agree: false });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [result, setResult] = useState(null);
  const firstError = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const earlyActive = stats ? stats.earlyBirdActive : true;
  const fee = earlyActive ? (stats?.fees?.earlyRupees ?? BATCH.earlyRupees) : (stats?.fees?.fullRupees ?? BATCH.fullRupees);
  const payNow = form.plan === "full" ? fee : fee / 2;
  const batchFull = stats ? stats.seatsLeft === 0 : false;
  const closed = stats ? !stats.paymentsEnabled : false;

  const validate = () => {
    const found = {};
    if (form.name.trim().length < 2) found.name = "Enter your full name.";
    if (!isValidIndianPhone(form.phone)) found.phone = "Enter a 10-digit WhatsApp number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) found.email = "Enter a valid email for the receipt.";
    if (!form.agree) found.agree = "Please confirm the refund rule and class timing.";
    return found;
  };

  const startPayment = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFailure("");
    setNotice("");
    if (Object.keys(found).length) {
      firstError.current?.querySelector("[role=alert]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    try {
      const Razorpay = await loadRazorpayCheckout();
      const order = await createEnrolment({
        name: form.name.trim(),
        phone: form.phone,
        email: form.email.trim(),
        college: form.college.trim(),
        language: form.language,
        plan: form.plan,
        company_website: honeypot,
      });
      if (order.amountRupees !== payNow) {
        // Someone took the last early-bird seat between page load and this click.
        // Never open checkout for an amount the student did not just see.
        setNotice(`The last early-bird seat just went. The amount is now ${rupees(order.amountRupees)}. Press pay again to continue.`);
        await refresh();
        setBusy(false);
        return;
      }
      capture("upsolve_checkout_opened", { plan: order.plan, earlyBird: order.earlyBird });
      const checkout = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Upsolve by Softogram",
        description: order.description,
        prefill: order.prefill,
        theme: { color: G },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setNotice("Payment was not completed and nothing was charged. Press pay when you are ready.");
          },
        },
        handler: async (response) => {
          try {
            const verified = await verifyEnrolment(order.enrolmentId, response);
            capture("upsolve_paid", { plan: verified.plan });
            setResult(verified);
            window.scrollTo(0, 0);
          } catch (err) {
            if (err?.response?.status === 400) {
              setFailure("We could not confirm this payment. If money left your account, do not pay again. WhatsApp " + PHONE_DISPLAY + " with your payment id.");
            } else {
              // Razorpay took the payment; only our confirmation call failed. The webhook will still record it.
              setUnverified(true);
            }
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on?.("payment.failed", () => {
        setNotice("That payment attempt failed and you were not charged. You can try again in the same window, or with another method.");
      });
      checkout.open();
    } catch (err) {
      setBusy(false);
      setFailure(apiErrorMessage(err, `Could not start the payment. Check your connection, or WhatsApp ${PHONE_DISPLAY} for a payment link.`));
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }} data-testid="upsolve-enrol-page">
      <SeoHead {...metaFor("/upsolve/enrol")} />
      <section className="pt-28 md:pt-32 pb-16 px-4 md:px-6">
        {result ? (
          <Success result={result} />
        ) : (
          <>
            <div className="max-w-[1120px] mx-auto flex items-center gap-3 flex-wrap mb-6 text-[13px]" style={{ color: DIM, fontFamily: MONO }}>
              <Link to="/upsolve" className="inline-flex items-center gap-2 no-underline min-h-[32px]" style={{ color: DIM }} data-testid="upsolve-enrol-back">
                <UpsolveMark size={20} />
                upsolve
              </Link>
              <span aria-hidden="true">/</span>
              <span style={{ color: TEXT }}>enrol</span>
              <span className="ml-auto inline-flex items-center gap-2" style={{ color: G }}>
                <Lock size={14} aria-hidden="true" />
                secure payment by Razorpay
              </span>
            </div>
            <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[3fr_2fr] gap-8 lg:gap-10 items-start">
              <form ref={firstError} onSubmit={startPayment} noValidate className="relative rounded-xl p-6 md:p-7 flex flex-col gap-5 min-w-0" style={{ background: CARD, border: `1px solid ${BORDER}` }} aria-label="Enrol in the college batch" data-testid="upsolve-enrol-form">
                <div>
                  <Eyebrow className="mb-1.5">Enrol . college batch . starts 30 Nov</Eyebrow>
                  <h1 className="text-3xl md:text-[34px] font-bold leading-tight mb-1.5" style={{ color: TEXT, fontFamily: DISPLAY }}>
                    Take your seat.
                  </h1>
                  <p className="text-[15px] leading-normal" style={{ color: DIM }}>
                    Your details, your plan, pay. Takes two minutes. Attended the demo? Use the same WhatsApp number.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <Field id="enrol-name" label="Full name" required error={errors.name}>
                    <input id="enrol-name" className={inputClass} style={fieldStyle} type="text" autoComplete="name" value={form.name} onChange={set("name")} data-testid="upsolve-enrol-name" aria-required="true" />
                  </Field>
                  <Field id="enrol-phone" label="WhatsApp number" required error={errors.phone}>
                    <input id="enrol-phone" className={inputClass} style={fieldStyle} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} data-testid="upsolve-enrol-phone" aria-required="true" />
                  </Field>
                  <Field id="enrol-email" label="Email" required error={errors.email} help="For the receipt and recordings">
                    <input id="enrol-email" className={inputClass} style={fieldStyle} type="email" autoComplete="email" value={form.email} onChange={set("email")} data-testid="upsolve-enrol-email" aria-required="true" />
                  </Field>
                  <Field id="enrol-college" label="College and year">
                    <input id="enrol-college" className={inputClass} style={fieldStyle} type="text" autoComplete="organization" value={form.college} onChange={set("college")} data-testid="upsolve-enrol-college" />
                  </Field>
                </div>
                <div className="max-w-[320px]">
                  <Field id="enrol-language" label="Language you will code in">
                    <select id="enrol-language" className={inputClass} style={fieldStyle} value={form.language} onChange={set("language")} data-testid="upsolve-enrol-language">
                      {LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <fieldset className="border-0 p-0 m-0 flex flex-col gap-2.5">
                  <legend className="text-[13px] font-semibold p-0 mb-2" style={{ color: TEXT }}>
                    Your plan
                  </legend>
                  <PlanOption id="plan-full" value="full" checked={form.plan === "full"} onChange={set("plan")} accent={earlyActive ? A : G} title={earlyActive ? "Early bird, full fee" : "Full fee"} note={earlyActive && stats ? `${rupees(fee)} for all 12 weeks. ${stats.earlyBirdLeft} of ${stats.earlyBirdTotal} early-bird seats left.` : `${rupees(fee)} for all 12 weeks.`} price={rupees(fee)} />
                  <PlanOption id="plan-instalment" value="instalment" checked={form.plan === "instalment"} onChange={set("plan")} accent={earlyActive ? A : G} title={earlyActive ? "Early bird, two instalments" : "Two instalments"} note={`${rupees(fee / 2)} now, ${rupees(fee / 2)} before week 7. Second payment link comes on WhatsApp.`} price={rupees(fee / 2)} priceNote="now" />
                  <p className="text-xs" style={{ color: DIM, fontFamily: MONO }}>
                    After the {BATCH.earlyTotal} early-bird seats are gone, the fee is {rupees(BATCH.fullRupees)}. The final amount is set when you pay.
                  </p>
                </fieldset>
                <div>
                  <label htmlFor="enrol-agree" className="flex gap-2.5 items-start text-sm leading-normal cursor-pointer" style={{ color: "#c9d1d9" }}>
                    <input id="enrol-agree" type="checkbox" checked={form.agree} onChange={set("agree")} data-testid="upsolve-enrol-agree" className="mt-0.5 shrink-0" style={{ accentColor: G, width: 18, height: 18 }} />
                    <span>I have read the refund rule: full refund if I leave before the 3rd class. Classes are live, camera on, Monday to Friday 7 to 9 pm.</span>
                  </label>
                  {errors.agree && (
                    <p className="text-xs mt-1.5" style={{ color: ERROR }} role="alert" data-testid="enrol-agree-error">
                      {errors.agree}
                    </p>
                  )}
                </div>
                <Honeypot value={honeypot} onChange={setHoneypot} testId="upsolve-enrol-honeypot" />
                {notice && (
                  <p className="text-sm rounded-sm px-3 py-2.5" style={{ color: A, border: `1px solid ${A}73` }} role="status" data-testid="upsolve-enrol-notice">
                    {notice}
                  </p>
                )}
                {failure && (
                  <p className="text-sm" style={{ color: ERROR }} role="alert" data-testid="upsolve-enrol-failure">
                    {failure}
                  </p>
                )}
                {unverified && (
                  <p className="text-sm rounded-sm px-3 py-2.5" style={{ color: G, border: `1px solid ${G}66` }} role="status" data-testid="upsolve-enrol-unverified">
                    Razorpay has your payment, but this page could not confirm it. Do not pay again. Your seat is recorded automatically and the receipt reaches your email soon.
                  </p>
                )}
                {batchFull || closed ? (
                  <div className="rounded-sm px-4 py-3.5 flex flex-col gap-3" style={{ border: `1px solid ${A}73` }} data-testid={batchFull ? "upsolve-enrol-full" : "upsolve-enrol-closed"}>
                    <p className="text-sm" style={{ color: TEXT }}>
                      {batchFull ? "This batch is full. Ask on WhatsApp for the waitlist." : "Online payment opens soon. Ask on WhatsApp for a payment link and I will send one."}
                    </p>
                    <WhatsAppLink href={WHATSAPP_PAYMENT_HREF} solid testId="upsolve-enrol-whatsapp">
                      Message on WhatsApp
                    </WhatsAppLink>
                  </div>
                ) : (
                  <button type="submit" disabled={busy || unverified} className="h-[52px] rounded-sm text-base font-medium inline-flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer" style={{ background: G, color: INK, fontFamily: MONO }} data-testid="upsolve-enrol-pay">
                    <Lock size={16} aria-hidden="true" />
                    {busy ? "Opening secure payment..." : `Pay ${rupees(payNow)} securely`}
                  </button>
                )}
                <p className="text-xs text-center" style={{ color: DIM }}>
                  UPI, cards, net banking and wallets, through Razorpay. You never enter card details on this site. {COLLECTED_BY}
                </p>
              </form>
              <aside className="flex flex-col gap-3.5 min-w-0">
                <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${G}66` }}>
                  <Eyebrow>What you are buying</Eyebrow>
                  <ul className="flex flex-col gap-2 text-sm list-none p-0 m-0" style={{ color: "#d1d5db" }}>
                    {INCLUDED.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                  {stats && (
                    <div className="mt-3.5 pt-3 flex justify-between text-[15px]" style={{ borderTop: `1px solid ${BORDER}`, color: TEXT, fontVariantNumeric: "tabular-nums" }} data-testid="upsolve-enrol-seats">
                      <span className="font-semibold">Seats</span>
                      <span>
                        <strong style={{ color: A }}>{stats.seatsTaken}</strong> of {stats.seatsTotal} taken
                      </span>
                    </div>
                  )}
                </div>
                <div className="rounded-xl p-5" style={{ background: INK, border: `1px solid ${BORDER}` }}>
                  <Eyebrow color={DIM}>The Upsolve guarantee</Eyebrow>
                  <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>
                    {GUARANTEE}
                  </p>
                  <p className="text-[13px] leading-normal mt-2.5" style={{ color: DIM }}>
                    {REFUND_RULE}
                  </p>
                </div>
                <div className="rounded-xl p-5" style={{ background: INK, border: `1px solid ${BORDER}` }}>
                  <Eyebrow color={DIM}>Not sure yet?</Eyebrow>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "#d1d5db" }}>
                    Come to the free demo first. Nothing to pay there.
                  </p>
                  <Link to="/upsolve#book" className="inline-flex items-center rounded-sm text-[13px] px-3.5 py-2.5 min-h-[44px] no-underline" style={{ border: `1px solid ${G}66`, color: TEXT, fontFamily: MONO }} data-testid="upsolve-enrol-demo">
                    Book the demo instead
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
