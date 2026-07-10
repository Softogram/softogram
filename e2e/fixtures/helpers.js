const SENDGRID_MOCK_URL = "http://localhost:8025";
const BACKEND_URL = "http://localhost:8001";

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

/** Force the next N mail sends to fail with the given status. */
async function forceSendFailure(request, status = 500, times = 1) {
  await request.post(`${SENDGRID_MOCK_URL}/behavior`, { data: { status, times } });
}

module.exports = { SENDGRID_MOCK_URL, BACKEND_URL, resetEmails, waitForEmails, forceSendFailure };
