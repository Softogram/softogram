// Products catalog (Phase 5) - static seeds + modal. Real products only (issue #73):
// two open-source tools plus two mobile apps marked "Coming soon".
const { test, expect } = require("@playwright/test");

test.describe("products page", () => {
  test("catalog renders four real product cards", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByTestId("products-page")).toBeVisible();
    await expect(page.getByTestId("products-hero")).toContainText(
      /build and ship/i,
    );
    await expect(page.getByTestId("product-card")).toHaveCount(4);
    await expect(page.getByTestId("placeholder-page")).toHaveCount(0);
  });

  test("filter chip narrows the grid", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("products-filter-open-source").click();
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await page.getByTestId("products-filter-mobile-app").click();
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await page.getByTestId("products-filter-all").click();
    await expect(page.getByTestId("product-card")).toHaveCount(4);
  });

  test("card opens modal with features; close dismisses it", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").first().click();
    const modal = page.getByTestId("product-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByTestId("product-modal-name")).toBeVisible();
    await expect(page.getByTestId("product-modal-features")).toBeVisible();
    // No fake reviews - reviews block only renders once there are real ones (issue #73).
    await expect(page.getByTestId("product-modal-reviews")).toHaveCount(0);
    await page.getByTestId("product-modal-close").click();
    await expect(modal).toHaveCount(0);
  });

  test("escape and backdrop close the modal", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").nth(1).click();
    await expect(page.getByTestId("product-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("product-modal")).toHaveCount(0);

    await page.getByTestId("product-card").nth(1).click();
    await expect(page.getByTestId("product-modal")).toBeVisible();
    await page
      .getByTestId("product-modal-backdrop")
      .click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId("product-modal")).toHaveCount(0);
  });

  test("Get started CTA links to home contact, Visit links to the real repo", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").first().click();
    await expect(page.getByTestId("product-modal-cta")).toHaveAttribute(
      "href",
      "/#contact",
    );
    await expect(page.getByTestId("product-modal-visit")).toHaveAttribute(
      "href",
      /^https:\/\/github\.com\/Softogram\//,
    );
  });

  const APPS = [
    { name: "Ryup", play: "https://play.google.com/store/apps/details?id=com.softogram.ryup_app" },
    { name: "SpiceCraft", play: "https://play.google.com/store/apps/details?id=com.softogram.spicecraft" },
  ];

  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ]) {
    for (const app of APPS) {
      test(`${app.name} shows the official Google Play badge (${viewport.name})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto("/products");
        await page.getByTestId("product-card").filter({ hasText: app.name }).click();
        const modal = page.getByTestId("product-modal");
        await expect(modal).toContainText("Live on Android");
        await expect(modal).not.toContainText("not downloadable");

        const play = page.getByTestId("product-modal-google-play");
        await expect(play).toHaveAttribute("href", app.play);
        await expect(play).toHaveAttribute("target", "_blank");
        await expect(play).toHaveAttribute("rel", "noopener noreferrer");
        const badge = play.getByRole("img", { name: `Get ${app.name} on Google Play` });
        await badge.scrollIntoViewIfNeeded();
        await expect(badge).toBeVisible();
        // The image actually loaded, and is big enough to tap comfortably.
        expect(await badge.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
        const box = await badge.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(48);

        await expect(page.getByTestId("product-modal-ios-note")).toHaveText("iPhone version coming soon");
        await expect(page.getByTestId("product-modal-app-store")).toHaveCount(0);
      });
    }
  }
});
