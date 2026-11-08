const { Client } = require("pg");

const EMAIL_MOCK_URL = "http://localhost:8025";
const RAZORPAY_MOCK_URL = "http://localhost:8026";
const BACKEND_URL = "http://localhost:8001";
const FRONTEND_URL = "http://localhost:3100";

// Same default as playwright.config.js's backend webServer, with the
// Python-only "+asyncpg" driver suffix stripped for the node `pg` client.
const DATABASE_URL = (
  process.env.DATABASE_URL || "postgresql+asyncpg://softogram:softogram@localhost:5432/softogram_e2e"
).replace("+asyncpg", "");

/** Poll Postgres until a `leads` row with this email exists; returns the row. */
async function waitForLead(email, timeoutMs = 10_000) {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const { rows } = await client.query("SELECT * FROM leads WHERE email = $1 ORDER BY created_at DESC LIMIT 1", [
        email,
      ]);
      if (rows.length) return rows[0];
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`no lead row for ${email} appeared in Postgres within ${timeoutMs}ms`);
  } finally {
    await client.end();
  }
}

/** Clear captured emails on the SES mock. */
async function resetEmails(request) {
  const res = await request.delete(`${EMAIL_MOCK_URL}/emails`);
  if (!res.ok() && res.status() !== 204) {
    throw new Error(`failed to reset SES mock: ${res.status()}`);
  }
}

/** Poll the mock until `count` emails have been captured (background task is async). */
async function waitForEmails(request, count = 1, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await request.get(`${EMAIL_MOCK_URL}/emails`);
    const emails = await res.json();
    if (emails.length >= count) return emails;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`SES mock did not capture ${count} email(s) within ${timeoutMs}ms`);
}

/** Poll until an email whose reply-to matches `email` appears. */
async function waitForEmailFrom(request, email, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await request.get(`${EMAIL_MOCK_URL}/emails`);
    const emails = await res.json();
    const match = emails.find((e) => e?.payload?.ReplyToAddresses?.[0] === email);
    if (match) return match;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`SES mock did not capture email from ${email} within ${timeoutMs}ms`);
}

/** Force the next N mail sends to fail with the given status. */
async function forceSendFailure(request, status = 500, times = 1) {
  await request.post(`${EMAIL_MOCK_URL}/behavior`, { data: { status, times } });
}

/** Phase 11 admin seeded via ADMIN_SEED_* on the e2e backend. */
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "e2e-admin-password";

async function adminToken(request) {
  const res = await request.post(`${BACKEND_URL}/api/admin/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(`admin login failed: ${res.status()} ${await res.text()}`);
  }
  return (await res.json()).token;
}

/** Empty the Upsolve tables, so seat counts start from zero and ids from 1. */
async function resetUpsolve(request) {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      "TRUNCATE upsolve_demo_bookings, upsolve_enrolments, upsolve_payment_events RESTART IDENTITY",
    );
  } finally {
    await client.end();
  }
  await request.delete(`${RAZORPAY_MOCK_URL}/orders`);
}

/** Post a Razorpay webhook with a correct signature, unless `signature` overrides it. */
async function sendRazorpayWebhook(request, payload, { eventId, signature } = {}) {
  const raw = JSON.stringify(payload);
  const signed = await (await request.post(`${RAZORPAY_MOCK_URL}/webhook-signature`, { data: raw })).json();
  return request.post(`${BACKEND_URL}/api/upsolve/razorpay/webhook`, {
    data: raw,
    headers: {
      "Content-Type": "application/json",
      "X-Razorpay-Signature": signature ?? signed.signature,
      "X-Razorpay-Event-Id": eventId ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    },
  });
}

async function adminUiLogin(page) {
  await page.goto("/admin");
  await page.getByTestId("admin-email").fill(ADMIN_EMAIL);
  await page.getByTestId("admin-password").fill(ADMIN_PASSWORD);
  await page.getByTestId("admin-login-button").click();
}

module.exports = {
  EMAIL_MOCK_URL,
  RAZORPAY_MOCK_URL,
  BACKEND_URL,
  FRONTEND_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  adminToken,
  adminUiLogin,
  resetEmails,
  resetUpsolve,
  sendRazorpayWebhook,
  waitForEmails,
  waitForEmailFrom,
  forceSendFailure,
  waitForLead,
};
