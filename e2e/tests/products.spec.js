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

  test("mobile apps are marked Coming soon and offer no download link", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.getByTestId("products-filter-mobile-app").click();
    for (const i of [0, 1]) {
      await page.getByTestId("product-card").nth(i).click();
      const modal = page.getByTestId("product-modal");
      await expect(modal).toContainText("Coming soon");
      await expect(page.getByTestId("product-modal-visit")).toHaveCount(0);
      await page.getByTestId("product-modal-close").click();
      await expect(modal).toHaveCount(0);
    }
  });
});
