// The one page that holds every store link.
// X and LinkedIn have a single website field each, so they point at this page,
// and a profile's "link in bio" is only true while these links are here.
const { test, expect } = require("@playwright/test");

const LINKS = [
  {
    testId: "apps-ryup-google-play",
    href: "https://play.google.com/store/apps/details?id=com.softogram.ryup_app",
    alt: "Get Ryup on Google Play",
  },
  {
    testId: "apps-spicecraft-google-play",
    href: "https://play.google.com/store/apps/details?id=com.softogram.spicecraft",
    alt: "Get SpiceCraft on Google Play",
  },
  {
    testId: "apps-spicecraft-app-store",
    href: "https://apps.apple.com/app/spicecraft-sort-puzzle/id6818140363",
    alt: "Download SpiceCraft on the App Store",
  },
];

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  test.describe(`/apps (${viewport.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/apps");
      await expect(page.getByTestId("apps-page")).toBeVisible();
    });

    for (const link of LINKS) {
      test(`shows ${link.alt} without a click`, async ({ page }) => {
        const anchor = page.getByTestId(link.testId);
        await expect(anchor).toHaveAttribute("href", link.href);
        await expect(anchor).toHaveAttribute("target", "_blank");
        await expect(anchor).toHaveAttribute("rel", "noopener noreferrer");

        const badge = anchor.getByRole("img", { name: link.alt });
        await badge.scrollIntoViewIfNeeded();
        await expect(badge).toBeVisible();
        // The image actually loaded, rather than leaving a broken-image box.
        expect(await badge.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
      });
    }

    test("never scrolls sideways", async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("leads a visitor who wanted the company back to the home page", async ({ page }) => {
      const home = page.getByTestId("apps-home-link");
      await expect(home).toBeVisible();
      await home.click();
      await expect(page).toHaveURL(/\/$/);
    });
  });
}

test("/apps has its own title, for the page a profile links to", async ({ page }) => {
  await page.goto("/apps");
  await expect(page).toHaveTitle(/apps/i);
});
