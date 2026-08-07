const { Client } = require("pg");

const SENDGRID_MOCK_URL = "http://localhost:8025";
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

/** Clear captured emails on the SendGrid mock. */
async function resetEmails(request) {
  const res = await request.delete(`${SENDGRID_MOCK_URL}/emails`);
  if (!res.ok() && res.status() !== 204) {
    throw new Error(`failed to reset sendgrid mock: ${res.status()}`);
  }
}

/** Poll the mock until `count` emails have been captured (background task is async). */
async function waitForEmails(request, count = 1, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await request.get(`${SENDGRID_MOCK_URL}/emails`);
    const emails = await res.json();
    if (emails.length >= count) return emails;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`sendgrid mock did not capture ${count} email(s) within ${timeoutMs}ms`);
}

/** Poll until an email whose reply_to matches `email` appears. */
async function waitForEmailFrom(request, email, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await request.get(`${SENDGRID_MOCK_URL}/emails`);
    const emails = await res.json();
    const match = emails.find((e) => e?.payload?.reply_to?.email === email);
    if (match) return match;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`sendgrid mock did not capture email from ${email} within ${timeoutMs}ms`);
}

/** Force the next N mail sends to fail with the given status. */
async function forceSendFailure(request, status = 500, times = 1) {
  await request.post(`${SENDGRID_MOCK_URL}/behavior`, { data: { status, times } });
}

module.exports = {
  SENDGRID_MOCK_URL,
  BACKEND_URL,
  FRONTEND_URL,
  resetEmails,
  waitForEmails,
  waitForEmailFrom,
  forceSendFailure,
  waitForLead,
};
