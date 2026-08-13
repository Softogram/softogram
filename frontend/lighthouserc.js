module.exports = {
  ci: {
    collect: {
      // Every public marketing route, not just the homepage (issue #94). The
      // content routes are the ones that render CMS cover images and fetch over
      // the network, so they are the most likely source of an LCP regression -
      // and they are the pages organic search actually lands on.
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/products",
        "http://127.0.0.1:4173/client-work",
        "http://127.0.0.1:4173/blog",
      ],
      // 3 runs, LHCI takes the median (issue #58). GitHub-hosted shared runners
      // are frequently CPU-starved for a few seconds at a time (noisy-neighbor
      // contention) - a single run can show 6s+ of Total Blocking Time on
      // otherwise-unchanged code purely from that, which numberOfRuns:1 had no
      // way to smooth over. Confirmed via two real incidents (PRs #57 and #59)
      // where the exact same commit measured perfect locally but failed in CI.
      numberOfRuns: 3,
      settings: {
        // Mobile form factor for the perf budget below (growth plan: mobile
        // performance >= 85). Do not pair this with preset:"desktop" - that
        // preset sets screenEmulation.mobile=false, which newer Lighthouse
        // versions hard-error on when formFactor is "mobile" (mismatch).
        formFactor: "mobile",
        screenEmulation: { mobile: true, disabled: false },
        throttlingMethod: "simulate",
      },
    },
    assert: {
      // Per-URL budgets. assertMatrix rather than one global block, so the
      // homepage keeps its hard-won budget while a slower content route cannot
      // silently drag the whole gate down to its own level.
      assertMatrix: [
        {
          matchingUrlPattern: "http://127.0.0.1:4173/$",
          assertions: {
            // Re-tightened after issue #56: drop dead Inter/Space Grotesk fonts
            // and load Fraunces/Outfit/JetBrains Mono via non-blocking <link> in
            // public/index.html (CSS @import was the real LCP bottleneck, not
            // three.js). Do not loosen these to accommodate another route.
            "categories:performance": ["error", { minScore: 0.85 }],
            "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
            // Measured 0.92 locally on this commit. Set just below to absorb
            // run-to-run noise; raise it as the remaining audits are fixed.
            "categories:accessibility": ["error", { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: "http://127.0.0.1:4173/(products|client-work|blog)$",
          assertions: {
            // Measured locally on this commit: products 0.87, client-work 0.91,
            // blog 0.86. 0.85 clears all three with margin. The gap to the
            // homepage is almost entirely colour contrast on intentionally dim
            // brand text, which is a design decision rather than a bug - see the
            // note in the accessibility issue before raising this.
            "categories:accessibility": ["error", { minScore: 0.85 }],

            // Warn, not error, on purpose. These routes have never been measured
            // in CI, and the only local numbers available were taken without a
            // backend, so cover images and CMS content never rendered - not
            // representative enough to gate on. This collects honest numbers from
            // a CI run with the full stack up; flip to "error" with real
            // thresholds once one green run has reported them. Tracked in #94.
            "categories:performance": ["warn", { minScore: 0.85 }],
            "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
          },
        },
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
