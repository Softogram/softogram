module.exports = {
  ci: {
    collect: {
      url: ["http://127.0.0.1:4173/"],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        // Mobile 4G simulation still used for scores when formFactor=mobile;
        // use mobile for Perf budget acceptance.
        formFactor: "mobile",
        throttlingMethod: "simulate",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
