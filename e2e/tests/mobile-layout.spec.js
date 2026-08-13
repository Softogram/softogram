// Mobile layout regressions at 390px: issues #81, #82, #83.
// Runs only under the "mobile" project (see playwright.config.js).
const { test, expect } = require("@playwright/test");

/** Dismiss the cookie banner, which is itself a fixed bottom overlay. */
async function acceptCookies(page) {
  const accept = page.getByTestId("consent-accept");
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
    await expect(page.getByTestId("consent-banner")).toBeHidden();
  }
}

/**
 * Scroll to the true bottom.
 *
 * A single scrollTo(scrollHeight) is not enough: lazy images keep loading and the
 * document keeps growing, so the first jump can land hundreds of pixels short and
 * leave the footer off screen entirely - which silently turns any footer assertion
 * into a no-op. Repeat until the offset stops moving.
 */
async function scrollToBottom(page) {
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
}

/**
 * Footer text that a floating control is sitting on top of.
 *
 * Hit-tests from each footer text node outward rather than from the overlay
 * inward: the acceptance criterion is about the footer staying readable, and
 * probing the overlay instead would also flag whatever unrelated section
 * happens to be behind it, which varies with page length.
 */
async function coveredFooterText(page) {
  return page.evaluate(() => {
    const footer = document.querySelector('[data-testid="footer"]');
    if (!footer) return ["<no footer>"];
    const overlays = ["lead-magnet-trigger", "whatsapp-button"]
      .map((id) => document.querySelector(`[data-testid="${id}"]`))
      .filter(Boolean);
    if (!overlays.length) return [];

    const hidden = new Set();
    for (const el of footer.querySelectorAll("*")) {
      // Leaf nodes only: ancestors trivially "contain" text they don't render.
      if (el.children.length || !el.textContent?.trim()) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.bottom < 0 || r.top > window.innerHeight) continue; // offscreen

      for (const [dx, dy] of [
        [0.5, 0.5],
        [0.9, 0.5],
      ]) {
        const top = document.elementFromPoint(r.left + r.width * dx, r.top + r.height * dy);
        if (top && overlays.some((o) => o === top || o.contains(top))) {
          hidden.add(el.textContent.trim().slice(0, 60));
          break;
        }
      }
    }
    return [...hidden];
  });
}

test.describe("mobile layout at 390px", () => {
  test("floating controls never cover footer text (issue #81)", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);

    await scrollToBottom(page);

    // The footer phone number was the specific casualty in the report. Assert it is
    // genuinely in the viewport, otherwise the coverage check below tests nothing.
    await expect(page.getByTestId("footer-phone")).toBeInViewport();
    expect(await coveredFooterText(page)).toEqual([]);
  });

  test("floating controls do not overlap each other (issue #81)", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);

    const fab = await page.getByTestId("lead-magnet-trigger").boundingBox();
    const wa = await page.getByTestId("whatsapp-button").boundingBox();
    expect(fab).not.toBeNull();
    expect(wa).not.toBeNull();

    const overlaps =
      fab.x < wa.x + wa.width &&
      fab.x + fab.width > wa.x &&
      fab.y < wa.y + wa.height &&
      fab.y + fab.height > wa.y;
    expect(overlaps).toBe(false);

    // Collapsed to an icon on mobile; the full-width pill was ~177px of a 390px screen.
    expect(fab.width).toBeLessThan(72);
  });

  test("first terminal card fits the viewport (issue #81)", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("terminal-section").scrollIntoViewIfNeeded();

    const strip = page.getByTestId("terminal-tools-scroll");
    await expect(strip).toBeVisible();

    // The real, interactive card is first. Its run button must be reachable
    // without horizontally scrolling the strip.
    const card = strip.locator("> div").first();
    const box = await card.boundingBox();
    const width = page.viewportSize().width;
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);

    await expect(page.getByTestId("terminal-run")).toBeInViewport();
  });

  test("page does not scroll horizontally (issue #81)", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  // The contract: within SETTLE_MS of arriving somewhere, nothing that is on screen
  // is still invisible. An instant scrollTo is the worst case - it teleports past
  // the observer's pre-trigger margin, so the fade only begins on arrival. Real
  // scrolling and anchor jumps are both covered by holding this bound.
  const SETTLE_MS = 250;

  test("no blank reveal gaps while scrolling (issue #82)", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);

    // Sample shortly after each jump, approximating what a fast scroller sees.
    // [data-reveal] targets the scroll-reveal primitive only - the hero has its
    // own deliberately delayed intro animation that is not this bug.
    const blanks = await page.evaluate(async (settleMs) => {
      const inViewReveals = () =>
        [...document.querySelectorAll("[data-reveal]")].filter((d) => {
          const r = d.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight && r.height > 0;
        });

      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));

      const height = document.body.scrollHeight;
      let blank = 0;
      let seen = 0;
      for (let i = 1; i <= 10; i++) {
        window.scrollTo(0, Math.round((height * i) / 11));
        await new Promise((r) => setTimeout(r, settleMs));
        const reveals = inViewReveals();
        seen += reveals.length;
        blank += reveals.filter(
          (d) => parseFloat(getComputedStyle(d).opacity) < 0.05
        ).length;
      }
      return { blank, seen };
    }, SETTLE_MS);

    // Guard against a vacuous pass: [data-reveal] is part of the fix, so a build
    // without it would otherwise report zero blanks simply by matching nothing.
    expect(blanks.seen).toBeGreaterThan(0);
    expect(blanks.blank).toBe(0);
  });

  test("headline matches how many demos are live (issue #83)", async ({ page }) => {
    await page.goto("/");
    const header = page.getByTestId("terminal-header");
    await header.scrollIntoViewIfNeeded();

    // The old copy promised every card was runnable; only one is.
    await expect(header).not.toContainText("Run the actual tool.");
    await expect(header).toContainText(/1 live/i);
    await expect(header).toContainText(/preview/i);
  });
});

test.describe("reduced motion at 390px", () => {
  test("content is never hidden behind a scroll reveal", async ({ page }) => {
    // emulateMedia before goto, rather than test.use({ reducedMotion }), so the
    // preference is already set when the hook seeds its initial state on mount.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    ).toBe(true);
    // Pages are lazy-loaded, so wait for real content before counting reveals -
    // querying too early finds none and the assertions below pass vacuously.
    await expect(page.getByTestId("services-section")).toBeAttached();
    await acceptCookies(page);

    // With reduced motion the reveal must be skipped outright, not merely sped up,
    // so below-the-fold content is readable before it is scrolled to.
    const reveals = await page.evaluate(() => {
      const all = [...document.querySelectorAll("[data-reveal]")];
      return { total: all.length, hidden: all.filter((d) => d.dataset.revealVisible !== "true").length };
    });

    // Same vacuous-pass guard as above.
    expect(reveals.total).toBeGreaterThan(0);
    expect(reveals.hidden).toBe(0);
  });
});
