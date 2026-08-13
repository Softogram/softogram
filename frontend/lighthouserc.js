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
            // Measured in CI: products 0.87, client-work 0.91, blog 0.86. Unlike
            // performance, accessibility scoring is deterministic rather than
            // sensitive to runner load, so 0.85 is a safe floor even though blog
            // clears it by only a point.
            //
            // The gap to the homepage is almost entirely colour contrast on
            // intentionally dim brand text (rgba(255,255,255,0.15-0.35)) plus tap
            // target sizes on the footer contact links. Both are design decisions
            // rather than bugs, so they are left alone - raise this floor only
            // alongside a deliberate decision to change those colours.
            "categories:accessibility": ["error", { minScore: 0.85 }],

            // Warn, not error - and deliberately kept that way for now.
            //
            // First CI run with the full stack up (PR #101) measured:
            //
            //   route          perf   LCP
            //   /              0.95   2239ms   <- gated as error above
            //   /products      0.89   3757ms
            //   /client-work   0.96   2694ms
            //   /blog          0.64   4527ms
            //
            // Three of the four routes miss the 2500ms LCP target the homepage
            // meets, and /blog misses the performance budget outright. These are
            // real findings, not measurement noise - the pages had simply never
            // been measured before.
            //
            // Raising these to "error" at the current numbers would bless a
            // broken page as the standard; setting them at 2500ms/0.85 today
            // would just make CI permanently red. So they stay as warnings that
            // surface the numbers on every run, and the underlying slowness is
            // tracked separately in issue #103. Flip to "error" at the homepage's
            // budget once that work lands.
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
