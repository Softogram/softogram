/**
 * Exit-intent / manual lead magnet for the launch checklist (issue #50).
 */
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ClipboardList } from "lucide-react";
import { capture } from "@/lib/analytics";

const G = "#4ade80";
const DIM = "#8b949e";
const CARD = "#161b22";
const BORDER = "rgba(255,255,255,0.08)";
const DISMISS_KEY = "softogram_lead_magnet_dismissed";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export default function LeadMagnet() {
  const { pathname } = useLocation();
  const hideOnAdmin = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openModal = useCallback((source) => {
    if (wasDismissed()) return;
    setOpen(true);
    setMessage("");
    setError("");
    capture("lead_magnet_opened", { source });
  }, []);

  const closeModal = () => {
    setOpen(false);
    markDismissed();
  };

  useEffect(() => {
    if (hideOnAdmin || wasDismissed()) return undefined;

    const onMouseOut = (e) => {
      if (e.clientY > 0) return;
      if (e.relatedTarget != null) return;
      // Don't fight the cookie banner on first paint.
      if (document.querySelector('[data-testid="consent-banner"]')) return;
      openModal("exit_intent");
    };

    // Delayed soft prompt so bots/fast bounces don't always see it.
    const timer = setTimeout(() => {
      document.addEventListener("mouseout", onMouseOut);
    }, 8000);

    const onOpenEvent = () => openModal("manual");
    window.addEventListener("softogram:open-lead-magnet", onOpenEvent);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("softogram:open-lead-magnet", onOpenEvent);
    };
  }, [openModal, hideOnAdmin]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post(
        `${API}/newsletter/subscribe`,
        { email, company_website: honeypot },
        { timeout: 8000 },
      );
      setMessage(data.message || "Check your inbox for the launch checklist.");
      capture("newsletter_subscribed", { alreadySubscribed: !!data.alreadySubscribed });
      markDismissed();
      setEmail("");
      setHoneypot("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not subscribe. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (hideOnAdmin) return null;

  return (
    <>
      {/*
        Icon-only below `sm` (issue #81). At 390px the full-text pill was 177px wide -
        nearly half the viewport - and sat on top of the footer contact block and the
        booking CTA. Collapsed to a 44px touch target it stacks cleanly above the 60px
        WhatsApp bubble (which sits at bottom:24px, so it occupies 24-84px); `bottom-24`
        starts this at 96px and leaves a 12px gap.
      */}
      <button
        type="button"
        data-testid="lead-magnet-trigger"
        aria-label="Free launch checklist"
        className="fixed bottom-24 right-6 z-[1050] flex items-center justify-center gap-2 rounded-sm shadow-lg h-11 w-11 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          color: G,
          fontFamily: "var(--font-mono)",
        }}
        onClick={() => openModal("fab")}
      >
        <ClipboardList size={16} aria-hidden="true" />
        <span className="hidden sm:inline text-xs">free launch checklist</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
          data-testid="lead-magnet-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-sm p-6"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-magnet-title"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2
                id="lead-magnet-title"
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#e2e8f0" }}
              >
                Launch checklist: 25 things before you go live
              </h2>
              <button
                type="button"
                data-testid="lead-magnet-close"
                onClick={closeModal}
                className="text-xs px-2 py-1 rounded-sm"
                style={{ color: DIM, border: `1px solid ${BORDER}` }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: DIM }}>
              Drop your email and we&apos;ll send Softogram&apos;s launch checklist — TLS, headers,
              analytics, and the boring stuff that saves launches.
            </p>
            <form onSubmit={onSubmit} className="space-y-3" data-testid="lead-magnet-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                data-testid="lead-magnet-email"
                className="w-full px-3 py-2 text-sm rounded-sm"
                style={{ background: "#0d1117", border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
              />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                data-testid="lead-magnet-honeypot"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
              />
              {message && (
                <p className="text-xs" style={{ color: G }} data-testid="lead-magnet-success">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-xs" style={{ color: "#f85149" }} data-testid="lead-magnet-error">
                  {typeof error === "string" ? error : "Could not subscribe."}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                data-testid="lead-magnet-submit"
                className="w-full py-2 text-xs font-semibold rounded-sm"
                style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
              >
                {busy ? "…" : "send me the checklist"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
