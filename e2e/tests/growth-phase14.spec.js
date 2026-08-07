// Phase 14 agent-ready subset — Cal.com booking (#48) + newsletter lead magnet (#50).
const { test, expect } = require("@playwright/test");
const { Client } = require("pg");
const {
  BACKEND_URL,
  resetEmails,
  waitForEmails,
} = require("../fixtures/helpers");

const DATABASE_URL = (
  process.env.DATABASE_URL || "postgresql+asyncpg://softogram:softogram@localhost:5432/softogram_e2e"
).replace("+asyncpg", "");

function e2eHeaders(id) {
  return { "X-E2E-Client-Id": id };
}

test.describe("Cal.com booking CTAs (issue #48)", () => {
  test("contact and nav booking buttons open cal.com and share data-testids", async ({ page }) => {
    await page.goto("/");
    const contact = page.getByTestId("booking-cta");
    await expect(contact).toBeVisible();
    await expect(contact).toHaveAttribute("href", /cal\.com\/softogram/);
    await expect(contact).toContainText(/book a free 30-min call/i);

    const nav = page.getByTestId("nav-booking-cta");
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute("href", /cal\.com/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId("nav-mobile-toggle").click();
    const mobile = page.getByTestId("nav-booking-cta-mobile");
    await expect(mobile).toBeVisible();
    await expect(mobile).toHaveAttribute("href", /cal\.com/);
  });
});

test.describe("Newsletter lead magnet (issue #50)", () => {
  test("subscribe stores email, sends checklist once, duplicates do not resend", async ({
    request,
  }) => {
    await resetEmails(request);
    const email = `newsletter-${Date.now()}@example.com`;

    const first = await request.post(`${BACKEND_URL}/api/newsletter/subscribe`, {
      headers: e2eHeaders(`nl-${email}`),
      data: { email },
    });
    expect(first.status()).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.status).toBe("success");
    expect(firstBody.alreadySubscribed).toBe(false);

    const emails = await waitForEmails(request, 1);
    expect(
      emails.some(
        (e) =>
          JSON.stringify(e.payload).includes(email) ||
          JSON.stringify(e.payload).toLowerCase().includes("launch checklist"),
      ),
    ).toBe(true);

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
      const { rows } = await client.query("SELECT email FROM newsletter_subscribers WHERE email = $1", [
        email,
      ]);
      expect(rows.length).toBe(1);
    } finally {
      await client.end();
    }

    await resetEmails(request);
    const dup = await request.post(`${BACKEND_URL}/api/newsletter/subscribe`, {
      headers: e2eHeaders(`nl-dup-${email}`),
      data: { email },
    });
    expect(dup.status()).toBe(200);
    expect((await dup.json()).alreadySubscribed).toBe(true);

    // No second SES send for duplicates.
    await new Promise((r) => setTimeout(r, 800));
    const after = await (await request.get("http://localhost:8025/emails")).json();
    expect(after.length).toBe(0);
  });

  test("honeypot subscribe pretends success without storing a row", async ({ request }) => {
    const email = `honey-nl-${Date.now()}@example.com`;
    const res = await request.post(`${BACKEND_URL}/api/newsletter/subscribe`, {
      headers: e2eHeaders(`nl-honey-${email}`),
      data: { email, company_website: "https://spam.example" },
    });
    expect(res.status()).toBe(200);

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
      const { rows } = await client.query("SELECT email FROM newsletter_subscribers WHERE email = $1", [
        email,
      ]);
      expect(rows.length).toBe(0);
    } finally {
      await client.end();
    }
  });

  test("FAB opens modal and UI subscribe succeeds", async ({ page, request }) => {
    await resetEmails(request);
    const email = `ui-nl-${Date.now()}@example.com`;

    await page.goto("/");
    await page.getByTestId("lead-magnet-trigger").click();
    await expect(page.getByTestId("lead-magnet-modal")).toBeVisible();
    await page.getByTestId("lead-magnet-email").fill(email);
    await page.getByTestId("lead-magnet-submit").click();
    await expect(page.getByTestId("lead-magnet-success")).toBeVisible({ timeout: 10000 });
    await waitForEmails(request, 1);
  });
});
