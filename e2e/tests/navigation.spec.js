// Route smoke: every public route renders real content.
const { test, expect } = require("@playwright/test");

const routes = [
  { path: "/case-studies", expectText: /case stud/i },
  { path: "/blog", expectText: /blog/i },
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

  // Desired behavior per issue #19: today unknown routes render a blank page.
  test.fixme("unknown route shows a branded 404 instead of a blank page (issue #19)", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByTestId("navbar")).toBeVisible();
  });
});
