// API-level e2e: real backend, real HTTP, SES mocked.
const { test, expect } = require("@playwright/test");
const {
  BACKEND_URL,
  FRONTEND_URL,
  resetEmails,
  waitForEmails,
  forceSendFailure,
  waitForEmailFrom,
  waitForLead,
} = require("../fixtures/helpers");

function e2eHeaders(id, extra = {}) {
  return { "X-E2E-Client-Id": id, ...extra };
}

test.describe("contact API", () => {
  test.beforeEach(async ({ request }) => {
    await resetEmails(request);
  });

  test("health endpoint responds", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ message: "Softogram API is Live" });
  });

  test("valid submission returns success and dispatches the notification email", async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("api-valid"),
      data: {
        name: "API Test User",
        email: "lead@example.com",
        phone: "+91-9876543210",
        service: "Custom Web Application",
        message: "I need a web app.\n\nBudget Range: ₹50,000 – ₹2,00,000",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");

    const emails = await waitForEmails(request, 2);
    const payload = emails.find((e) =>
      (e.payload.Content?.Simple?.Subject?.Data || "").includes("API Test User"),
    )?.payload;
    expect(payload).toBeTruthy();
    expect(payload.ReplyToAddresses[0]).toBe("lead@example.com");
    expect(payload.FromEmailAddress).toBe("e2e-sender@softogram.test");
    expect(payload.Destination.ToAddresses[0]).toBe("e2e-inbox@softogram.test");
    const html = payload.Content.Simple.Body.Html.Data;
    expect(html).toContain("I need a web app.");
    expect(html).toContain("+91-9876543210");
    expect(html).toContain("Custom Web Application");

    const autoReply = emails.find((e) =>
      (e.payload.Content?.Simple?.Subject?.Data || "").toLowerCase().includes("received your softogram"),
    );
    expect(autoReply).toBeTruthy();
    expect(autoReply.payload.Destination.ToAddresses[0]).toBe("lead@example.com");
  });

  test("invalid email address is rejected with 422 and sends nothing", async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("api-invalid"),
      data: {
        name: "Bad Email",
        email: "not-an-email",
        phone: "+91-9876543210",
        service: "Game Development",
        message: "hi",
      },
    });
    expect(res.status()).toBe(422);

    await new Promise((r) => setTimeout(r, 1000));
    const emails = await (await request.get("http://localhost:8025/emails")).json();
    expect(emails).toHaveLength(0);
  });

  test("oversized and malformed contact payloads get 422 and send nothing (issue #8)", async ({
    request,
  }) => {
    const base = {
      name: "Valid Name",
      email: "valid@example.com",
      phone: "+91-9876543210",
      service: "Custom Software",
      message: "hello",
    };

    const cases = [
      { ...base, name: "x".repeat(101) },
      { ...base, phone: "abc" },
      { ...base, phone: "123" },
      { ...base, phone: "+91-" + "9".repeat(30) },
      { ...base, service: "s".repeat(101) },
      { ...base, message: "m".repeat(5001) },
    ];

    for (let i = 0; i < cases.length; i++) {
      const res = await request.post(`${BACKEND_URL}/api/contact`, {
        headers: e2eHeaders(`api-validate-${i}`),
        data: cases[i],
      });
      expect(res.status(), `case ${i}`).toBe(422);
    }

    await new Promise((r) => setTimeout(r, 1000));
    const emails = await (await request.get("http://localhost:8025/emails")).json();
    expect(emails).toHaveLength(0);
  });

  test("legacy /api/status is gone and does not hang (issue #6)", async ({ request }) => {
    const started = Date.now();
    const res = await request.get(`${BACKEND_URL}/api/status`);
    expect(res.status()).toBe(404);
    expect(Date.now() - started).toBeLessThan(3000);
  });

  test("visitor still gets success when SES is down and lead is persisted in Postgres (issue #3)", async ({
    request,
  }) => {
    await forceSendFailure(request, 500, 5);
    const email = `persist-${Date.now()}@example.com`;
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("api-persist"),
      data: {
        name: "Persist Test",
        email,
        phone: "+91-9000000000",
        service: "Custom Software",
        message: "Please keep this lead even if email fails.",
      },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).status).toBe("success");

    const lead = await waitForLead(email);
    expect(lead.name).toBe("Persist Test");
    expect(lead.status).toBe("new");
    expect(lead.storage).toBe("postgres");

    // The lead row lands synchronously, well before the background retry loop
    // (3 attempts, exponential backoff) finishes. Wait for that background task
    // to actually settle before this test ends - otherwise its retries can still
    // be in flight when the next test starts, and a late-arriving email leaks
    // into that test's SES mock assertions.
    const fs = require("fs");
    const path = require("path");
    const failuresFile = path.join(__dirname, "../../backend/data/contact_email_failures.jsonl");
    await expect
      .poll(
        () => {
          if (!fs.existsSync(failuresFile)) return false;
          return fs.readFileSync(failuresFile, "utf8").includes(email);
        },
        { timeout: 10_000 },
      )
      .toBe(true);
  });

  test("preflight from a foreign origin is not reflected (issue #2)", async ({ request }) => {
    const res = await request.fetch(`${BACKEND_URL}/api/contact`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.example.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    const acao = res.headers()["access-control-allow-origin"];
    expect(acao).not.toBe("https://evil.example.com");
    expect(acao).not.toBe("*");
  });

  test("preflight from the allowed frontend origin is accepted (issue #2)", async ({ request }) => {
    const res = await request.fetch(`${BACKEND_URL}/api/contact`, {
      method: "OPTIONS",
      headers: {
        Origin: FRONTEND_URL,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    expect(res.headers()["access-control-allow-origin"]).toBe(FRONTEND_URL);
  });

  test("HTML in form fields arrives escaped in the notification email (issue #4)", async ({ request }) => {
    await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("api-xss"),
      data: {
        name: '<img src=x onerror=alert(1)>\r\nBcc: evil@x.com',
        email: "xss@example.com",
        phone: "+91-9111111111",
        service: "AI-Powered Automation",
        message: "<b>bold</b>",
      },
    });
    const emails = await waitForEmails(request, 2);
    const inquiry = emails.find((e) =>
      (e.payload.Content?.Simple?.Subject?.Data || "").includes("New Project Inquiry"),
    );
    expect(inquiry).toBeTruthy();
    const htmlBody = inquiry.payload.Content.Simple.Body.Html.Data;
    const subject = inquiry.payload.Content.Simple.Subject.Data || "";
    expect(htmlBody).not.toContain("<img src=x");
    expect(htmlBody).toContain("&lt;img src=x");
    expect(htmlBody).not.toContain("<b>bold</b>");
    expect(htmlBody).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(subject).not.toMatch(/[\r\n]/);
  });

  test("honeypot submissions return success but send no email (issue #5)", async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("api-honeypot"),
      data: {
        name: "Bot",
        email: "bot@example.com",
        phone: "+91-9111111111",
        service: "Spam",
        message: "spam",
        company_website: "https://spam.example",
      },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).status).toBe("success");
    await new Promise((r) => setTimeout(r, 1200));
    const emails = await (await request.get("http://localhost:8025/emails")).json();
    expect(emails).toHaveLength(0);
  });

  test("3rd rapid submission from same client is rate-limited (issue #5)", async ({ request }) => {
    // Avoid polluting the SES mock with burst traffic emails.
    await forceSendFailure(request, 500, 10);
    const id = `api-rate-${Date.now()}`;
    const payload = {
      name: "Rate Limit",
      email: "rate@example.com",
      phone: "+91-9000000001",
      service: "Custom Software",
      message: "burst",
    };
    const headers = e2eHeaders(id, { "X-E2E-Strict-Limit": "1" });

    for (let i = 0; i < 2; i++) {
      const res = await request.post(`${BACKEND_URL}/api/contact`, { headers, data: payload });
      expect(res.status()).toBe(200);
    }
    const blocked = await request.post(`${BACKEND_URL}/api/contact`, { headers, data: payload });
    expect(blocked.status()).toBe(429);
    expect((await blocked.json()).detail).toMatch(/too many/i);
  });
});
