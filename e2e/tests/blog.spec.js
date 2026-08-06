// Blog list + post (Phase 7).
const { test, expect } = require("@playwright/test");

test.describe("blog", () => {
  test("list renders featured and cards", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByTestId("blog-page")).toBeVisible();
    await expect(page.getByTestId("blog-hero")).toContainText(/insights/i);
    await expect(page.getByTestId("blog-featured")).toBeVisible();
    await expect(page.getByTestId("blog-post-card")).toHaveCount(2);
    await expect(page.getByTestId("placeholder-page")).toHaveCount(0);
  });

  test("tag filter narrows posts", async ({ page }) => {
    await page.goto("/blog");
    await page.getByTestId("blog-filter-design").click();
    await expect(page.getByTestId("blog-featured")).toContainText(/Fraunces/i);
    await expect(page.getByTestId("blog-post-card")).toHaveCount(0);
  });

  test("navigating to a slug shows the post", async ({ page }) => {
    await page.goto("/blog/building-ai-agents-production");
    await expect(page.getByTestId("blog-post-page")).toBeVisible();
    await expect(page.getByTestId("blog-post-title")).toContainText(/AI Agents/i);
    await expect(page.getByTestId("blog-post-content")).toBeVisible();
    await expect(page.getByTestId("blog-post-cta")).toHaveAttribute("href", "/#contact");
  });

  test("unknown slug shows not found", async ({ page }) => {
    await page.goto("/blog/does-not-exist");
    await expect(page.getByTestId("blog-post-not-found")).toBeVisible();
  });
});
