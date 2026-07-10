// Landing page smoke: brand-critical sections render.
const { test, expect } = require("@playwright/test");

test.describe("landing page", () => {
  test("hero, key sections, and CTAs render", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("hero-cta-quote")).toBeVisible();

    for (const section of ["stats-section", "services-section", "pricing-section", "contact-section"]) {
      await expect(page.getByTestId(section)).toBeAttached();
    }
  });

  test("WhatsApp floating button is present and links to WhatsApp", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByTestId("whatsapp-button");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("href", /wa\.me/);
  });

  // Desired behavior per issue #12: wa.me requires the country code.
  test.fixme("WhatsApp link uses full international number (issue #12)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("whatsapp-button")).toHaveAttribute("href", /wa\.me\/91\d{10}/);
  });
});
