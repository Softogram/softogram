// Products catalog (Phase 5) — static seeds + modal.
const { test, expect } = require("@playwright/test");

test.describe("products page", () => {
  test("catalog renders three product cards", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByTestId("products-page")).toBeVisible();
    await expect(page.getByTestId("products-hero")).toContainText(/build and sell/i);
    await expect(page.getByTestId("product-card")).toHaveCount(3);
    await expect(page.getByTestId("placeholder-page")).toHaveCount(0);
  });

  test("filter chip narrows the grid", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("products-filter-analytics").click();
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByTestId("product-card")).toContainText("DataPulse");
    await page.getByTestId("products-filter-all").click();
    await expect(page.getByTestId("product-card")).toHaveCount(3);
  });

  test("card opens modal with features; close dismisses it", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").first().click();
    const modal = page.getByTestId("product-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByTestId("product-modal-name")).toBeVisible();
    await expect(page.getByTestId("product-modal-features")).toBeVisible();
    await expect(page.getByTestId("product-modal-reviews")).toBeVisible();
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
    await page.getByTestId("product-modal-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId("product-modal")).toHaveCount(0);
  });

  test("Get started CTA links to home contact", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").first().click();
    await expect(page.getByTestId("product-modal-cta")).toHaveAttribute("href", "/#contact");
  });
});
