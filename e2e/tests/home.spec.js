// Landing page smoke: redesign Phase 2 chrome + hero + contact.
const { test, expect } = require("@playwright/test");

test.describe("landing page", () => {
  test("redesign hero, placeholders, and contact render", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("hero-cta-quote")).toBeVisible();
    await expect(page.getByTestId("hero-headline")).toContainText(/ships/i);

    // Mid-page placeholders until Phases 3–4
    for (const section of ["terminal-section", "build-log-section", "shipped-section", "services-section"]) {
      await expect(page.getByTestId(section)).toBeAttached();
    }

    await expect(page.getByTestId("contact-section")).toBeAttached();
  });

  // WhatsApp float was part of the old home; redesign home omits it for now.
  test.fixme("WhatsApp floating button is present and links to WhatsApp (deferred)", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByTestId("whatsapp-button");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("href", /wa\.me/);
  });

  test.fixme("WhatsApp link uses full international number (issue #12)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("whatsapp-button")).toHaveAttribute("href", /wa\.me\/91\d{10}/);
  });
});
