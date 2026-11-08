// The flyer QR code is scanned on a phone, so 390px is the width that matters most.
const { test, expect } = require("@playwright/test");
const { resetUpsolve } = require("../fixtures/helpers");

const fitsWidth = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe("upsolve on a phone", () => {
  test.beforeEach(async ({ request }) => {
    await resetUpsolve(request);
  });

  for (const [path, ready] of [
    ["/upsolve", "upsolve-counters"],
    ["/upsolve/enrol", "upsolve-enrol-pay"],
  ]) {
    test(`${path} has no sideways scroll`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId(ready)).toBeVisible();
      expect(await fitsWidth(page)).toBe(true);
    });
  }

  test("a student who scans the QR code can jump straight to the form", async ({ page }) => {
    await page.goto("/upsolve");
    await page.getByTestId("upsolve-hero-book").click();
    await expect(page.getByTestId("upsolve-booking-name")).toBeInViewport();
  });

  test("the booking button is a comfortable tap target", async ({ page }) => {
    await page.goto("/upsolve");
    const box = await page.getByTestId("upsolve-booking-submit").boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
