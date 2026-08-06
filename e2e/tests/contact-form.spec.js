// Contact form: posts to FastAPI /api/contact; SendGrid captured via mock on :8025.
const { test, expect } = require("@playwright/test");
const { resetEmails, waitForEmails } = require("../fixtures/helpers");

test.describe("contact form", () => {
  test.beforeEach(async ({ request }) => {
    await resetEmails(request);
  });

  test("filled submit shows success and delivers the lead email", async ({ page, request }) => {
    await page.goto("/");
    await page.getByTestId("contact-section").scrollIntoViewIfNeeded();

    await page.getByTestId("contact-name-input").fill("Playwright Visitor");
    await page.getByTestId("contact-email-input").fill("visitor@example.com");
    await page.getByTestId("contact-phone-input").fill("+91-9876501234");
    await page.getByTestId("contact-type-saas").click();
    await page.getByTestId("contact-message-textarea").fill("We want an online store for our shop.");
    await page.getByTestId("contact-submit-button").click();

    await expect(page.getByTestId("contact-success")).toBeVisible({ timeout: 15000 });

    const emails = await waitForEmails(request, 1);
    expect(emails[0].payload.reply_to.email).toBe("visitor@example.com");
  });

  test("empty submit is blocked by browser required fields and sends nothing", async ({ page, request }) => {
    await page.goto("/");
    await page.getByTestId("contact-section").scrollIntoViewIfNeeded();
    await page.getByTestId("contact-submit-button").click();

    // Native HTML5 validation keeps the form (no success panel)
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
    await expect(page.getByTestId("contact-form")).toBeVisible();

    await page.waitForTimeout(500);
    const emails = await (await request.get("http://localhost:8025/emails")).json();
    expect(emails).toHaveLength(0);
  });
});
