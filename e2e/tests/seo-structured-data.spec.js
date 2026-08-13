// BreadcrumbList, image alt text, and 404 noindex (issue #79).
const { test, expect } = require("@playwright/test");

/** All JSON-LD on the page, flattened - SeoHead may emit a single object or an array. */
async function jsonLd(page) {
  return page.evaluate(() => {
    const el = document.getElementById("softogram-jsonld");
    if (!el) return [];
    try {
      const parsed = JSON.parse(el.textContent);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [{ __parseError: true }];
    }
  });
}

async function breadcrumb(page) {
  const blocks = await jsonLd(page);
  return blocks.find((b) => b["@type"] === "BreadcrumbList");
}

// `ready` is a testid that only exists once the lazy-loaded route has mounted.
// Meta tags are written by SeoHead in an effect, so reading <head> before the
// route renders returns the static index.html values instead (which is issue #80
// in miniature - the raw HTML genuinely does carry the homepage canonical).
const ROUTES = [
  { path: "/blog", ready: "blog-page", trail: ["Home", "Blog"] },
  { path: "/client-work", ready: "client-work-page", trail: ["Home", "Client Work"] },
  { path: "/products", ready: "products-page", trail: ["Home", "Products"] },
];

test.describe("structured data (issue #79)", () => {
  for (const { path, ready, trail } of ROUTES) {
    test(`${path} exposes a valid BreadcrumbList`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId(ready)).toBeVisible();
      await expect(page.locator("#softogram-jsonld")).toBeAttached();

      const crumb = await breadcrumb(page);
      expect(crumb, `no BreadcrumbList on ${path}`).toBeTruthy();
      expect(crumb.itemListElement.map((i) => i.name)).toEqual(trail);

      // position must be 1-based and contiguous, and every item needs an absolute
      // URL - Google drops the whole breadcrumb otherwise.
      crumb.itemListElement.forEach((item, i) => {
        expect(item.position).toBe(i + 1);
        expect(item.item).toMatch(/^https:\/\/softogram\.in\//);
      });
    });
  }

  test("blog post carries both BreadcrumbList and BlogPosting", async ({ page }) => {
    await page.goto("/blog");
    const firstPost = page.getByTestId("blog-featured").or(page.getByTestId("blog-card").first());
    await firstPost.click();
    await expect(page.getByTestId("blog-post-page")).toBeVisible();

    const blocks = await jsonLd(page);
    const types = blocks.map((b) => b["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("BlogPosting");

    // Deepest crumb is the post itself, so the trail is Home > Blog > post.
    const crumb = blocks.find((b) => b["@type"] === "BreadcrumbList");
    expect(crumb.itemListElement).toHaveLength(3);
    expect(crumb.itemListElement[1].name).toBe("Blog");
  });

  test("every public route sets a self-referencing canonical", async ({ page }) => {
    for (const { path, ready } of ROUTES) {
      await page.goto(path);
      await expect(page.getByTestId(ready)).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://softogram.in${path}`
      );
    }
  });
});

test.describe("content images (issue #79)", () => {
  test("blog cover images have meaningful alt text", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByTestId("blog-featured").or(page.getByTestId("blog-card").first())).toBeVisible();

    const empty = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => !img.getAttribute("alt")?.trim())
        .map((img) => img.getAttribute("src"))
    );
    expect(empty).toEqual([]);
  });
});

test.describe("404 handling (issue #79)", () => {
  test("unknown route is noindex with its own title", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByTestId("not-found-page")).toBeVisible();

    await expect(page).toHaveTitle(/Page not found/i);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/noindex/i);
  });

  test("the noindex directive does not leak onto real pages", async ({ page }) => {
    // One shared <head> is mutated across routes, so a stale noindex left behind
    // by the 404 would quietly deindex whatever the user navigated to next.
    await page.goto("/this-route-does-not-exist");
    await expect(page.locator('meta[name="robots"]')).toBeAttached();

    await page.goto("/blog");
    await expect(page.getByTestId("blog-page")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});
