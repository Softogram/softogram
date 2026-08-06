// SEO smoke: baseline meta is present and sane (Phase 8).
const { test, expect } = require("@playwright/test");

test.describe("seo", () => {
  test("homepage has title, description, OG tags, and JSON-LD", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Softogram/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.{50,}/);

    const ogTitle = page.locator('meta[property="og:title"]').first();
    await expect(ogTitle).toHaveAttribute("content", /Softogram/);

    const ogImage = page.locator('meta[property="og:image"]').first();
    await expect(ogImage).toHaveAttribute("content", /og-banner/);

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(jsonLd);
    expect(data["@type"]).toBe("ProfessionalService");
    expect(data.name).toBe("Softogram");
    expect(JSON.stringify(data)).not.toContain("XXXXXXXXXX");
    expect(data.logo).toMatch(/softogram-logo/);
    expect(data.image).toMatch(/og-banner\.png/);
    expect(data.email).toMatch(/support@softogram\.in/);
  });

  test("blog route has its own title (issue #13)", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/blog/i);
  });

  test("products and client-work have unique titles", async ({ page }) => {
    await page.goto("/products");
    await expect(page).toHaveTitle(/products/i);
    await page.goto("/client-work");
    await expect(page).toHaveTitle(/client work/i);
  });

  test("policy pages have unique titles", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page).toHaveTitle(/privacy/i);
    await expect(page.getByTestId("policy-page")).toBeVisible();
  });
});
