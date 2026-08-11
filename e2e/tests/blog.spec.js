// Blog list + post (CMS-backed, issue #17).
const { test, expect } = require("@playwright/test");

test.describe("blog", () => {
  test("list renders featured and cards", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByTestId("blog-page")).toBeVisible();
    await expect(page.getByTestId("blog-hero")).toContainText(/insights/i);
    await expect(page.getByTestId("blog-featured")).toBeVisible();
    await expect(page.getByTestId("blog-card").first()).toBeVisible();
  });

  test("tag filter narrows posts", async ({ page }) => {
    await page.goto("/blog");
    await page.getByTestId("blog-filter-checklist").click();
    await expect(page.getByTestId("blog-featured")).toContainText(
      /Launch checklist/i,
    );
  });

  test("navigating to a slug shows the post with JSON-LD", async ({ page }) => {
    await page.goto("/blog/how-we-built-polluxkart");
    await expect(page.getByTestId("blog-post-page")).toBeVisible();
    await expect(page.getByTestId("blog-post-title")).toContainText(
      /Polluxkart/i,
    );
    await expect(page.getByTestId("blog-post-content")).toBeVisible();
    const jsonLd = await page.locator("#softogram-jsonld").textContent();
    expect(jsonLd).toContain("BlogPosting");
    expect(jsonLd).toContain("Polluxkart");
  });

  test("unknown slug shows not found", async ({ page }) => {
    await page.goto("/blog/does-not-exist");
    await expect(page.getByTestId("blog-post-not-found")).toBeVisible();
  });

  test("post shows a CTA and related posts (issue #76)", async ({ page }) => {
    await page.goto("/blog/how-we-built-polluxkart");
    await expect(page.getByTestId("blog-post-cta")).toBeVisible();
    await expect(page.getByTestId("blog-post-cta-button")).toHaveAttribute(
      "href",
      /cal\.com/,
    );
    await expect(page.getByTestId("blog-related-posts")).toBeVisible();
    await expect(
      page.getByTestId("blog-related-post-card").first(),
    ).toBeVisible();
  });
});
