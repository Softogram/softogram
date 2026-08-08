// Client Work catalog (Phase 6).
const { test, expect } = require("@playwright/test");

test.describe("client work page", () => {
  test("catalog renders project cards", async ({ page }) => {
    await page.goto("/client-work");
    await expect(page.getByTestId("client-work-page")).toBeVisible();
    await expect(page.getByTestId("client-work-hero")).toContainText(/actually built/i);
    await expect(page.getByTestId("client-project-card")).toHaveCount(4);
    await expect(page.getByTestId("placeholder-page")).toHaveCount(0);
  });

  test("industry filter narrows the grid", async ({ page }) => {
    await page.goto("/client-work");
    await page.getByTestId("client-work-filter-gaming").click();
    await expect(page.getByTestId("client-project-card")).toHaveCount(1);
    await expect(page.getByTestId("client-project-card")).toContainText("Syn-Grid");
    await page.getByTestId("client-work-filter-open-source").click();
    await expect(page.getByTestId("client-project-card")).toHaveCount(2);
    await page.getByTestId("client-work-filter-all").click();
    await expect(page.getByTestId("client-project-card")).toHaveCount(4);
  });

  test("card opens modal with outcome; close dismisses", async ({ page }) => {
    await page.goto("/client-work");
    await page.getByTestId("client-project-card").first().click();
    const modal = page.getByTestId("client-project-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByTestId("client-project-modal-title")).toBeVisible();
    await expect(page.getByTestId("client-project-modal-outcome")).toBeVisible();
    await page.getByTestId("client-project-modal-close").click();
    await expect(modal).toHaveCount(0);
  });
});
