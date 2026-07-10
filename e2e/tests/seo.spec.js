// SEO smoke: baseline meta is present and sane.
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
  });

  // Desired behavior per issue #13: JSON-LD must have no placeholders.
  test.fixme("JSON-LD contains no placeholder telephone (issue #13)", async ({ page }) => {
    await page.goto("/");
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).not.toContain("XXXXXXXXXX");
  });

  // Desired behavior per issue #13: each route gets unique meta.
  test.fixme("blog route has its own title (issue #13)", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/blog/i);
  });
});
