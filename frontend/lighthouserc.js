module.exports = {
  ci: {
    collect: {
      url: ["http://127.0.0.1:4173/"],
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
      assertions: {
        // Re-tightened after issue #56: drop dead Inter/Space Grotesk fonts and
        // load Fraunces/Outfit/JetBrains Mono via non-blocking <link> in
        // public/index.html (CSS @import was the real LCP bottleneck, not three.js).
        "categories:performance": ["error", { minScore: 0.85 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
