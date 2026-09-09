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

  /**
   * Google Search Console ownership check.
   *
   * Google fetches this exact path and expects the token as the whole body. It
   * has to keep working forever, not just until verification passes: Google
   * re-checks periodically and silently drops the property when the file goes
   * missing, taking indexing controls and search data with it. Nothing else in
   * the app references the file, so without this test deleting it looks
   * harmless right up until search data stops arriving weeks later.
   *
   * The exact-body check matters too. The site serves index.html for unknown
   * paths, so a missing file would come back as a 200 with a page of HTML
   * rather than a 404 - a status-only assertion would pass while verification
   * fails.
   */
  test("Google Search Console verification file is served verbatim", async ({ request }) => {
    const res = await request.get("/google9b483326c284b34c.html");

    expect(res.status()).toBe(200);
    expect((await res.text()).trim()).toBe(
      "google-site-verification: google9b483326c284b34c.html"
    );
  });
});
