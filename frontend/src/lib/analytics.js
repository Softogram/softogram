/** Lightweight PostHog helper — only loads after consent (issue #15). */

const CONSENT_KEY = "softogram_analytics_consent";

export function getAnalyticsConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  if (value === "accepted") {
    initPostHog();
  }
}

export function capture(event, props = {}) {
  try {
    if (getAnalyticsConsent() !== "accepted") return;
    window.posthog?.capture?.(event, props);
  } catch {
    /* ignore */
  }
}

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (getAnalyticsConsent() !== "accepted") return;
  if (window.posthog?.__loaded) return;

  const key = process.env.REACT_APP_POSTHOG_KEY;
  const host = process.env.REACT_APP_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key) {
    // No key configured — events no-op until env is set.
    window.posthog = window.posthog || {
      __loaded: true,
      capture: () => {},
      opt_out_capturing: () => {},
    };
    return;
  }

  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        persistence: "localStorage",
        // Session recording only after consent (gated by calling init only then).
        disable_session_recording: false,
        loaded: (ph) => {
          ph.__loaded = true;
        },
      });
      window.posthog = posthog;
    })
    .catch(() => {});
}
