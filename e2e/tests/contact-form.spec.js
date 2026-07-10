// Full-stack e2e: real browser -> React form -> FastAPI -> SendGrid mock.
const { test, expect } = require("@playwright/test");
const { resetEmails, waitForEmails } = require("../fixtures/helpers");

test.describe("contact form", () => {
  test.beforeEach(async ({ request }) => {
    await resetEmails(request);
  });

  test("submitting the form delivers the lead email end to end", async ({ page, request }) => {
    await page.goto("/");
    await page.getByTestId("contact-section").scrollIntoViewIfNeeded();

    await page.getByTestId("contact-name-input").fill("Playwright Visitor");
    await page.getByTestId("contact-email-input").fill("visitor@example.com");
    await page.getByTestId("contact-phone-input").fill("+91-9876501234");

    // Radix select: open the trigger, pick an option from the portal
    await page.getByTestId("contact-service-select").click();
    await page.getByRole("option", { name: "E-commerce Platform" }).click();

    await page.getByTestId("contact-budget-select").click();
    await page.getByRole("option", { name: "₹2,00,000+" }).click();

    await page.getByTestId("contact-message-textarea").fill("We want an online store for our shop.");
    await page.getByTestId("contact-submit-button").click();

    // Success toast from the backend response
    await expect(page.getByText("Thank you! We'll get back to you shortly.")).toBeVisible();

    // Form resets on success
    await expect(page.getByTestId("contact-name-input")).toHaveValue("");

    // The notification email reached (mock) SendGrid with the right content
    const emails = await waitForEmails(request, 1);
    const payload = emails[0].payload;
    expect(payload.subject).toContain("Playwright Visitor");
    expect(payload.reply_to.email).toBe("visitor@example.com");
    const html = payload.content[0].value;
    expect(html).toContain("We want an online store for our shop.");
    expect(html).toContain("Budget Range: ₹2,00,000+");
    expect(html).toContain("E-commerce Platform");
  });

  test("client-side validation blocks empty submits and sends nothing", async ({ page, request }) => {
    await page.goto("/");
    await page.getByTestId("contact-section").scrollIntoViewIfNeeded();
    await page.getByTestId("contact-submit-button").click();

    await expect(page.getByText("Please fill in all required fields")).toBeVisible();

    await page.waitForTimeout(1000);
    const emails = await (await request.get("http://localhost:8025/emails")).json();
    expect(emails).toHaveLength(0);
  });
});
