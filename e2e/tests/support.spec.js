/**
 * The support page, softogram.in/support.
 *
 * SpiceCraft's App Store listing gives this exact address as its Support URL,
 * and Apple's reviewers open it. Apple asks for a page a player can reach with
 * a real way to contact the developer, so these tests check that the contact
 * details sit on the page itself, not only in the footer, and that they are
 * working links.
 *
 * The site sends the same app shell with HTTP 200 for every path, so a
 * status-code check passes a page that does not exist (the browser shows the
 * 404 page). Every test here reads what the browser actually rendered.
 */
const { test, expect } = require("@playwright/test");

const ADDRESS = "180/2E/18, Ganga Vihar, Dhoomanganj, Prayagraj, Uttar Pradesh 211011, India";

test.describe("support page", () => {
  test("renders the support page, not the 404", async ({ page }) => {
    await page.goto("/support");

    await expect(page).toHaveTitle("Support | Softogram");
    await expect(page.locator("h1")).toHaveText("Support");
    await expect(page.getByTestId("policy-page")).toBeVisible();
    await expect(page.getByTestId("not-found-page")).toHaveCount(0);
  });

  test("gives working contact details on the page itself", async ({ page }) => {
    await page.goto("/support");

    const email = page.getByTestId("support-email");
    await expect(email).toHaveText("support@softogram.in");
    await expect(email).toHaveAttribute("href", "mailto:support@softogram.in");
    // Green on grey body text is about 1.8:1, so the underline is what marks
    // a link for a reader who cannot tell the colours apart.
    await expect(email).toHaveCSS("text-decoration-line", "underline");

    const phone = page.getByTestId("support-phone");
    await expect(phone).toHaveText("+91 6360158761");
    await expect(phone).toHaveAttribute("href", "tel:+916360158761");

    // The App Store names the seller as the registered company, not the
    // brand, so the page has to tie the two together for a reviewer.
    await expect(page.getByTestId("support-company")).toHaveText("Opengram Labs Private Limited");
    await expect(page.getByTestId("support-address")).toHaveText(ADDRESS);
    await expect(page.getByTestId("support-brand-note")).toHaveText(
      "Softogram is a brand of Opengram Labs Private Limited."
    );
  });

  test("tells a SpiceCraft player how to report an advert", async ({ page }) => {
    await page.goto("/support");

    // The exact words of the game's own Settings row (SettingsScreen.cs,
    // "ReportAdRow"), so a player can find it. toHaveText, not toContainText:
    // "Report an advert" would contain "Report an ad".
    await expect(page.getByTestId("support-report-ad")).toContainText("Settings");
    await expect(page.getByTestId("support-report-ad-row")).toHaveText("Report an ad");

    // The same address and subject the game's row opens, for a player who
    // would rather write directly.
    await expect(page.getByTestId("support-report-ad-email")).toHaveAttribute(
      "href",
      "mailto:support@softogram.in?subject=Report%20an%20ad"
    );
  });

  test("names the game's consent row exactly as the game does", async ({ page }) => {
    await page.goto("/support");

    // SettingsScreen.AdPrivacyRowTitle in the game.
    await expect(page.getByTestId("support-ad-privacy-row")).toHaveText("Ad privacy choices");
  });

  test("links to the SpiceCraft privacy policy", async ({ page }) => {
    await page.goto("/support");

    await page.getByTestId("support-spicecraft-privacy").click();

    await expect(page).toHaveURL(/\/spicecraft\/privacy$/);
    await expect(page.locator("h1")).toHaveText("SpiceCraft Privacy Policy");
  });
});
