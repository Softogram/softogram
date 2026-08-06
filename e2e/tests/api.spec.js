// API-level e2e: real backend, real HTTP, SendGrid mocked.
const { test, expect } = require("@playwright/test");
const { BACKEND_URL, FRONTEND_URL, resetEmails, waitForEmails, forceSendFailure } = require("../fixtures/helpers");

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

    const emails = await waitForEmails(request, 1);
    const payload = emails[0].payload;
    expect(payload.subject).toContain("API Test User");
    expect(payload.reply_to.email).toBe("lead@example.com");
    expect(payload.from.email).toBe("e2e-sender@softogram.test");
    expect(payload.personalizations[0].to[0].email).toBe("e2e-inbox@softogram.test");
    const html = payload.content[0].value;
    expect(html).toContain("I need a web app.");
    expect(html).toContain("+91-9876543210");
    expect(html).toContain("Custom Web Application");
  });

  test("invalid email address is rejected with 422 and sends nothing", async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      data: {
        name: "Bad Email",
        email: "not-an-email",
        phone: "123",
        service: "Game Development",
        message: "hi",
      },
    });
    expect(res.status()).toBe(422);

    // give a background task a moment; nothing should arrive
    await new Promise((r) => setTimeout(r, 1000));
    const emails = await (await request.get("http://localhost:8025/emails")).json();
    expect(emails).toHaveLength(0);
  });

  test("visitor still gets success when SendGrid is down and lead is persisted (issue #3)", async ({
    request,
  }) => {
    const fs = require("fs");
    const path = require("path");
    const leadsFile = path.join(__dirname, "../../backend/data/contact_leads.jsonl");
    const before = fs.existsSync(leadsFile) ? fs.readFileSync(leadsFile, "utf8") : "";

    await forceSendFailure(request, 500, 5);
    const email = `persist-${Date.now()}@example.com`;
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      data: {
        name: "Persist Test",
        email,
        phone: "+91-9000000000",
        service: "Custom Software",
        message: "Please keep this lead even if email fails.",
      },
    });
    // Visitor still sees success; lead must already be durable on disk.
    expect(res.status()).toBe(200);
    expect((await res.json()).status).toBe("success");

    await expect
      .poll(() => (fs.existsSync(leadsFile) ? fs.readFileSync(leadsFile, "utf8") : ""), {
        timeout: 5000,
      })
      .toContain(email);

    const after = fs.readFileSync(leadsFile, "utf8");
    expect(after.length).toBeGreaterThan(before.length);
    const lastLine = after.trim().split("\n").pop();
    const record = JSON.parse(lastLine);
    expect(record.email).toBe(email);
    expect(record.storage).toMatch(/jsonl/);
  });

  // Issue #2 — foreign origins must not be reflected.
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

  // Desired behavior per issue #4; enable once HTML escaping lands.
  test.fixme("HTML in form fields arrives escaped in the notification email (issue #4)", async ({ request }) => {
    await request.post(`${BACKEND_URL}/api/contact`, {
      data: {
        name: '<img src=x onerror=alert(1)>',
        email: "xss@example.com",
        phone: "+91-9111111111",
        service: "AI-Powered Automation",
        message: "<b>bold</b>",
      },
    });
    const emails = await waitForEmails(request, 1);
    const html = emails[0].payload.content[0].value;
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });
});
