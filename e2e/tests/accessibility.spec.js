// Landmark, skip link, and heading structure (issue #93).
const { test, expect } = require("@playwright/test");

const ROUTES = [
  { path: "/", ready: "hero-section" },
  { path: "/products", ready: "products-page" },
  { path: "/client-work", ready: "client-work-page" },
  { path: "/blog", ready: "blog-page" },
];

test.describe("landmarks (issue #93)", () => {
  for (const { path, ready } of ROUTES) {
    test(`${path} has exactly one main landmark`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId(ready)).toBeVisible();

      // Exactly one: zero means screen reader users cannot skip the nav, and two
      // (Layout's plus the one Admin used to render) is invalid HTML.
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main#main")).toBeAttached();
    });
  }
});

test.describe("skip link (issue #93)", () => {
  test("is the first thing a keyboard user reaches, and works", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-section")).toBeVisible();

    await page.keyboard.press("Tab");
    const skip = page.getByTestId("skip-link");
    await expect(skip).toBeFocused();
    // sr-only until focused, then it must actually be on screen to be usable.
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");
    // Focus must land on <main>, not merely scroll to it - otherwise the next Tab
    // walks back into the nav and the link has achieved nothing.
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("is present on every route", async ({ page }) => {
    for (const { path, ready } of ROUTES) {
      await page.goto(path);
      await expect(page.getByTestId(ready)).toBeVisible();
      await expect(page.getByTestId("skip-link")).toBeAttached();
    }
  });
});

test.describe("accessible names (issue #93)", () => {
  test("no interactive control is left unnamed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-section")).toBeVisible();

    const unnamed = await page.evaluate(() => {
      const nameOf = (el) =>
        (
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          (el.getAttribute("aria-labelledby") &&
            document.getElementById(el.getAttribute("aria-labelledby"))?.textContent) ||
          el.textContent ||
          ""
        ).trim();

      return [...document.querySelectorAll("button, a[href], input, select, textarea")]
        .filter((el) => {
          if (el.closest('[aria-hidden="true"]')) return false;
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return false; // not rendered
          if (el.matches("input, select, textarea")) {
            const labelled =
              el.labels?.length ||
              el.getAttribute("aria-label") ||
              el.getAttribute("aria-labelledby") ||
              el.getAttribute("placeholder");
            return !labelled;
          }
          return !nameOf(el);
        })
        .map((el) => `${el.tagName}: ${el.outerHTML.slice(0, 90)}`);
    });

    expect(unnamed).toEqual([]);
  });
});
