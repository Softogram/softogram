// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

/**
 * E2E stack (all started automatically by Playwright):
 *   1. SES mock        -> http://localhost:8025  (fixtures/ses-mock.js)
 *   2. Razorpay mock   -> http://localhost:8026  (fixtures/razorpay-mock.js)
 *   3. FastAPI backend -> http://localhost:8001  (real server, emails and payments go to the mocks)
 *   4. React frontend  -> http://localhost:3100  (real CRA dev server)
 *
 * Backend python: uses backend/.venv if present, otherwise python3 on PATH.
 * Backend needs Postgres reachable at DATABASE_URL (default: the `softogram_e2e`
 * database from the root docker-compose.yml) - run `docker compose up -d` first.
 * See e2e/README.md for one-time setup.
 */

const ROOT = path.resolve(__dirname, "..");
const VENV_PYTHON = path.join(ROOT, "backend", ".venv", "bin", "python");
const PYTHON = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : "python3";

const EMAIL_MOCK_URL = "http://localhost:8025";
const RAZORPAY_MOCK_URL = "http://localhost:8026";
const BACKEND_URL = "http://localhost:8001";
const FRONTEND_URL = "http://localhost:3100";

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // Mobile specs carry their own narrow-viewport project below; running them
      // at desktop width would assert nothing meaningful.
      testIgnore: /mobile-.*\.spec\.js/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // 390x844 is the iPhone 12/13/14 CSS viewport and the exact width the
      // layout bugs in issue #81 were reported at. Scoped by testMatch so the
      // rest of the suite does not silently double in runtime.
      name: "mobile",
      testMatch: /mobile-.*\.spec\.js/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: [
    {
      command: "node fixtures/ses-mock.js",
      url: `${EMAIL_MOCK_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: "node fixtures/razorpay-mock.js",
      url: `${RAZORPAY_MOCK_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
      env: {
        RAZORPAY_KEY_SECRET: "e2e-razorpay-secret",
        RAZORPAY_WEBHOOK_SECRET: "e2e-webhook-secret",
      },
    },
    {
      command: `${PYTHON} -m uvicorn server:app --port 8001`,
      cwd: path.join(ROOT, "backend"),
      url: `${BACKEND_URL}/api/`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        AWS_SES_ENDPOINT_URL: EMAIL_MOCK_URL,
        AWS_SES_REGION: "ap-south-2",
        AWS_ACCESS_KEY_ID: "e2e-test-key",
        AWS_SECRET_ACCESS_KEY: "e2e-test-secret",
        SENDER_EMAIL: "e2e-sender@softogram.test",
        RECIPIENT_EMAIL: "e2e-inbox@softogram.test",
        CORS_ORIGINS: FRONTEND_URL,
        DATABASE_URL:
          process.env.DATABASE_URL || "postgresql+asyncpg://softogram:softogram@localhost:5432/softogram_e2e",
        ALLOW_E2E_CLIENT_ID: "1",
        CONTACT_RATE_LIMIT_PER_MINUTE: "30",
        CONTACT_RATE_LIMIT_PER_HOUR: "200",
        ADMIN_LOGIN_RATE_LIMIT_PER_MINUTE: "30",
        ADMIN_LOGIN_RATE_LIMIT_PER_HOUR: "200",
        ADMIN_SEED_EMAIL: "admin@example.com",
        ADMIN_SEED_PASSWORD: "e2e-admin-password",
        // Explicitly blank, not merely unset: dotenv only skips keys already PRESENT in
        // the environment, so an absent key here still gets filled in from a developer's
        // local backend/.env if it happens to have real PostHog credentials - breaking
        // the "PostHog isn't configured" test's isolation. Presence (even empty) wins.
        POSTHOG_API_KEY: "",
        POSTHOG_PROJECT_ID: "",
        // Upsolve payments: test keys that only the Razorpay mock accepts.
        RAZORPAY_KEY_ID: "rzp_test_e2e",
        RAZORPAY_KEY_SECRET: "e2e-razorpay-secret",
        RAZORPAY_WEBHOOK_SECRET: "e2e-webhook-secret",
        RAZORPAY_API_BASE: RAZORPAY_MOCK_URL,
        UPSOLVE_RATE_LIMIT_PER_MINUTE: "500",
        UPSOLVE_RATE_LIMIT_PER_HOUR: "5000",
        // Far-future demos, so these tests do not start failing after the last real demo.
        UPSOLVE_DEMOS_JSON: JSON.stringify([
          { date: "2099-03-01", label: "Sunday 1 March, 6 pm" },
          { date: "2099-03-07", label: "Saturday 7 March, 6 pm" },
        ]),
      },
    },
    {
      command: "yarn start",
      cwd: path.join(ROOT, "frontend"),
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: {
        PORT: "3100",
        BROWSER: "none",
        REACT_APP_BACKEND_URL: BACKEND_URL,
        // The page loads Razorpay's checkout script from here; in e2e that is a
        // window.Razorpay stand-in served by the mock.
        REACT_APP_RAZORPAY_CHECKOUT_URL: `${RAZORPAY_MOCK_URL}/checkout-stub.js`,
        ENABLE_HEALTH_CHECK: "false",
      },
    },
  ],
});

module.exports.urls = { EMAIL_MOCK_URL, RAZORPAY_MOCK_URL, BACKEND_URL, FRONTEND_URL };
