// Route smoke: every public route renders real content.
const { test, expect } = require("@playwright/test");

const routes = [
  { path: "/client-work", expectText: /actually built/i },
  { path: "/products", expectText: /build and ship/i },
  { path: "/blog", expectText: /insights/i },
  { path: "/privacy-policy", expectText: /privacy policy/i },
  { path: "/terms-and-conditions", expectText: /terms/i },
  { path: "/refund-policy", expectText: /refund/i },
  { path: "/cookie-policy", expectText: /cookie/i },
];

test.describe("routes", () => {
  for (const { path, expectText } of routes) {
    test(`${path} renders`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1, h2").filter({ hasText: expectText }).first()).toBeVisible();
    });
  }

  test("unknown route shows a branded 404 with site chrome (issues #19 / #22)", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("not-found-page")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("case-studies redirects to client-work", async ({ page }) => {
    await page.goto("/case-studies");
    await expect(page).toHaveURL(/\/client-work$/);
    await expect(page.getByTestId("client-work-page")).toBeVisible();
  });
});
