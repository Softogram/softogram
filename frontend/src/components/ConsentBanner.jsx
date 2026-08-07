/** Cookie / analytics consent banner (issue #15). */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  initPostHog,
} from "@/lib/analytics";

const G = "#4ade80";
const DIM = "#8b949e";
const CARD = "#161b22";
const BORDER = "rgba(255,255,255,0.08)";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getAnalyticsConsent();
    if (!existing) {
      setVisible(true);
    } else if (existing === "accepted") {
      initPostHog();
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      data-testid="consent-banner"
      className="fixed bottom-0 left-0 right-0 z-[1100] p-4"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-sm p-4"
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          pointerEvents: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
          We use optional analytics cookies (PostHog) to improve Softogram.{" "}
          <Link to="/cookie-policy" style={{ color: G }}>
            Cookie policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            data-testid="consent-decline"
            className="px-3 py-1.5 text-xs rounded-sm"
            style={{
              color: DIM,
              border: `1px solid ${BORDER}`,
              fontFamily: "var(--font-mono)",
              background: "transparent",
            }}
            onClick={() => {
              setAnalyticsConsent("declined");
              setVisible(false);
            }}
          >
            decline
          </button>
          <button
            type="button"
            data-testid="consent-accept"
            className="px-3 py-1.5 text-xs rounded-sm font-semibold"
            style={{
              background: G,
              color: "#0d1117",
              fontFamily: "var(--font-mono)",
            }}
            onClick={() => {
              setAnalyticsConsent("accepted");
              setVisible(false);
            }}
          >
            accept
          </button>
        </div>
      </div>
    </div>
  );
}
