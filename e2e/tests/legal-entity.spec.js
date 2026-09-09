/**
 * Registered legal entity in the site footer.
 *
 * Softogram is a brand name; the registered company is Opengram Labs Private
 * Limited. App store enrolment and client due diligence both start with someone
 * opening softogram.in and checking that the site belongs to the company named
 * on the application. If the two names are not tied together on the page, that
 * check fails and the reviewer comes back asking for more information.
 *
 * The block lives in Layout, so these tests assert it on every kind of route -
 * a marketing page, a policy page and the 404 - not just the homepage.
 */
const { test, expect } = require("@playwright/test");

const LEGAL_NAME = "Opengram Labs Private Limited";
const ADDRESS = "180/2E/18, Ganga Vihar, Dhoomanganj, Prayagraj, Uttar Pradesh 211011, India";
const CIN = "U62011UP2026PTC251899";
const BRAND_NOTE = "Softogram is a brand of Opengram Labs Private Limited.";

const ROUTES = [
  "/",
  "/products",
  "/client-work",
  "/blog",
  "/privacy-policy",
  "/terms-and-conditions",
  "/definitely-not-a-page",
];

test.describe("legal entity footer", () => {
  for (const path of ROUTES) {
    test(`${path} shows the registered entity`, async ({ page }) => {
      await page.goto(path);

      const legal = page.getByTestId("footer-legal");
      await expect(legal).toBeVisible();

      await expect(page.getByTestId("footer-legal-name")).toHaveText(LEGAL_NAME);
      await expect(page.getByTestId("footer-legal-address")).toHaveText(ADDRESS);
      await expect(page.getByTestId("footer-legal-cin")).toHaveText(`CIN: ${CIN}`);

      // The line doing the real work: it explains the brand/company name
      // difference before anyone has to ask.
      await expect(page.getByTestId("footer-brand-note")).toHaveText(BRAND_NOTE);
    });
  }

  test("company contact details are actionable links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("footer-legal-email")).toHaveAttribute(
      "href",
      "mailto:founder@softogram.in"
    );
    await expect(page.getByTestId("footer-legal-phone")).toHaveAttribute(
      "href",
      "tel:+916360158761"
    );
  });

  test("no private identifiers are published", async ({ page }) => {
    await page.goto("/");
    const body = await page.locator("body").innerText();

    // PAN (Permanent Account Number) is the company's tax id. Unlike CIN and
    // GSTIN it is not something we publish, so neither the label nor a bare PAN
    // may appear. GSTIN legitimately contains the PAN as its middle ten
    // characters - that is how a GSTIN is built, and the whole string is public
    // record on the GST portal - so the check below only rejects a PAN standing
    // on its own, which is why the word boundaries matter.
    expect(body).not.toMatch(/\bPAN\b/);
    expect(body.match(/\b[A-Z]{5}\d{4}[A-Z]\b/g) || []).toEqual([]);
  });

  /**
   * The launch-checklist button and the WhatsApp bubble are fixed to the
   * bottom-right of the viewport, so they float over whatever is in the footer's
   * bottom-right corner once the page is scrolled to the end. That is where a
   * reviewer looks, and a covered CIN is the same as a missing one - the first
   * draft of this block put the registration numbers straight underneath them.
   */
  test("floating controls never cover the entity details", async ({ page }) => {
    await page.goto("/");

    const accept = page.getByTestId("consent-accept");
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
      await expect(page.getByTestId("consent-banner")).toBeHidden();
    }

    // Lazy images keep growing the document, so one scrollTo can land short and
    // leave the footer off screen - which would make this assert nothing.
    await page.evaluate(async () => {
      let last = -1;
      for (let i = 0; i < 25; i++) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 150));
        const y = Math.round(window.scrollY);
        if (y === last) return;
        last = y;
      }
    });

    await expect(page.getByTestId("footer-brand-note")).toBeInViewport();

    const covered = await page.evaluate(() => {
      const overlays = [
        ...document.querySelectorAll(
          '[data-testid="whatsapp-button"], [data-testid="lead-magnet-trigger"], [data-testid="consent-banner"]'
        ),
      ];
      const legal = document.querySelector('[data-testid="footer-legal"]');
      const hidden = [];
      for (const el of legal.querySelectorAll("[data-testid]")) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        for (const [dx, dy] of [
          [0.02, 0.5],
          [0.5, 0.5],
          [0.98, 0.5],
        ]) {
          const top = document.elementFromPoint(r.left + r.width * dx, r.top + r.height * dy);
          if (top && overlays.some((o) => o === top || o.contains(top))) {
            hidden.push(el.dataset.testid);
            break;
          }
        }
      }
      return hidden;
    });

    expect(covered).toEqual([]);
  });

  test("the structured data carries the same legal name (machine-readable check)", async ({
    page,
  }) => {
    await page.goto("/");
    const jsonLd = await page.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      return el ? JSON.parse(el.textContent) : null;
    });

    expect(jsonLd.legalName).toBe(LEGAL_NAME);
    expect(jsonLd.address.postalCode).toBe("211011");
    expect(jsonLd.address.streetAddress).toContain("Ganga Vihar");
  });
});
