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

// Most students open this from a flyer QR code on a budget Android phone, so these
// run at the sizes those phones really give the browser once its address bar is showing.
const NARROW = { width: 320, height: 568 };
const BUDGET_ANDROID = { width: 360, height: 640 };

/** What a finger would actually hit at this point of the screen. */
const tappedAt = (page, x, y) =>
  page.evaluate(([px, py]) => {
    const hit = document.elementFromPoint(px, py);
    const owner = hit && hit.closest("[data-testid]");
    return owner ? owner.getAttribute("data-testid") : hit && hit.tagName;
  }, [x, y]);

async function declineCookies(page) {
  const decline = page.getByTestId("consent-decline");
  await decline.click();
  await expect(page.getByTestId("consent-banner")).toBeHidden();
}

test.describe("upsolve on small phones", () => {
  test.beforeEach(async ({ request }) => {
    await resetUpsolve(request);
  });

  for (const size of [NARROW, BUDGET_ANDROID, { width: 412, height: 915 }]) {
    for (const [path, ready] of [
      ["/upsolve", "upsolve-counters"],
      ["/upsolve/enrol", "upsolve-enrol-pay"],
    ]) {
      test(`${path} has no sideways scroll at ${size.width} wide`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto(path);
        await expect(page.getByTestId(ready)).toBeVisible();
        expect(await fitsWidth(page)).toBe(true);
      });
    }
  }

  test.describe("at the size of a budget Android phone", () => {
    test.use({ viewport: BUDGET_ANDROID });

    test("the Book button is on the first screen, clear of the cookie banner", async ({ page }) => {
      await page.goto("/upsolve");
      await expect(page.getByTestId("consent-banner")).toBeVisible();
      const button = page.getByTestId("upsolve-hero-book");
      await expect(button).toBeInViewport({ ratio: 1 });
      const box = await button.boundingBox();
      expect(await tappedAt(page, box.x + box.width / 2, box.y + box.height / 2)).toBe("upsolve-hero-book");
    });

    test("the cookie banner buttons are comfortable to tap", async ({ page }) => {
      await page.goto("/upsolve");
      for (const id of ["consent-decline", "consent-accept"]) {
        const box = await page.getByTestId(id).boundingBox();
        expect(box.height, id).toBeGreaterThanOrEqual(44);
      }
    });

    test("the WhatsApp bubble never covers the booking button", async ({ page }) => {
      await page.goto("/upsolve");
      await declineCookies(page);
      const submit = page.getByTestId("upsolve-booking-submit");
      // Put the button exactly where the bubble floats: the bottom of the screen.
      await submit.evaluate((el) => {
        window.scrollTo({ top: el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 30, behavior: "instant" });
      });
      await expect
        .poll(async () => {
          const box = await submit.boundingBox();
          return tappedAt(page, box.x + box.width - 20, box.y + box.height / 2);
        })
        .toBe("upsolve-booking-submit");
    });

    test("the WhatsApp bubble comes back once nothing is under it", async ({ page }) => {
      await page.goto("/upsolve");
      await declineCookies(page);
      const bubble = page.getByTestId("whatsapp-button");
      await page.getByTestId("upsolve-why").evaluate((el) => {
        const firstParagraph = el.querySelector("p + h2 + p") || el;
        window.scrollTo({ top: firstParagraph.getBoundingClientRect().top + window.scrollY - 200, behavior: "instant" });
      });
      await expect(bubble).toHaveCSS("opacity", "1");
      const box = await bubble.boundingBox();
      expect(await tappedAt(page, box.x + box.width / 2, box.y + box.height / 2)).toBe("whatsapp-button");
    });

    test("the menu covers the page and hides the bubble", async ({ page }) => {
      await page.goto("/upsolve");
      await declineCookies(page);
      await page.getByTestId("nav-mobile-toggle").click();
      const lastLink = page.getByTestId("nav-contact-mobile");
      await lastLink.scrollIntoViewIfNeeded();
      await expect(lastLink).toBeInViewport({ ratio: 1 });
      await expect(page.getByTestId("whatsapp-button")).toHaveCSS("pointer-events", "none");
      // The drawer is still sliding open at first, so give it a moment to settle.
      await expect
        .poll(async () => {
          const box = await lastLink.boundingBox();
          return tappedAt(page, box.x + box.width - 20, box.y + box.height / 2);
        })
        .toBe("nav-contact-mobile");
    });

    test("menu and top bar controls are comfortable to tap", async ({ page }) => {
      await page.goto("/upsolve");
      await declineCookies(page);
      const toggle = await page.getByTestId("nav-mobile-toggle").boundingBox();
      expect(toggle.height).toBeGreaterThanOrEqual(44);
      expect(toggle.width).toBeGreaterThanOrEqual(44);
      await page.getByTestId("nav-mobile-toggle").click();
      const link = await page.getByTestId("nav-contact-mobile").boundingBox();
      expect(link.height).toBeGreaterThanOrEqual(44);
    });

    test("the coach's name comes before their profile links", async ({ page }) => {
      await page.goto("/upsolve");
      const name = await page.getByTestId("upsolve-teacher-name").boundingBox();
      const firstLink = await page.getByTestId("upsolve-teacher-codeforces").boundingBox();
      expect(name.y).toBeLessThan(firstLink.y);
    });

    test("the coach's profile links are comfortable to tap", async ({ page }) => {
      await page.goto("/upsolve");
      for (const id of ["codeforces", "leetcode", "codechef", "github", "linkedin"]) {
        const box = await page.getByTestId(`upsolve-teacher-${id}`).boundingBox();
        expect(box.height, id).toBeGreaterThanOrEqual(44);
      }
    });

    test("a student who books sees the confirmation without scrolling", async ({ page }) => {
      await page.goto("/upsolve");
      await declineCookies(page);
      await page.getByTestId("upsolve-booking-name").fill("Asha Rao");
      await page.getByTestId("upsolve-booking-phone").fill("9876543210");
      await page.getByTestId("upsolve-booking-demo-2099-03-07").check();
      await page.getByTestId("upsolve-booking-submit").click();
      await expect(page.getByTestId("upsolve-booking-success")).toBeInViewport({ ratio: 0.9 });
    });

    test("the longest year option fits inside its box", async ({ page }) => {
      await page.goto("/upsolve");
      const year = page.getByTestId("upsolve-booking-year");
      await year.selectOption("School student");
      const fits = await year.evaluate((el) => {
        const style = getComputedStyle(el);
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${style.fontSize} ${style.fontFamily}`;
        // Room left after the padding and the arrow the browser draws on the right.
        const room = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 20;
        return ctx.measureText(el.value).width <= room;
      });
      expect(fits).toBe(true);
    });

    test("the back link on the enrol page is comfortable to tap", async ({ page }) => {
      await page.goto("/upsolve/enrol");
      const box = await page.getByTestId("upsolve-enrol-back").boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe("at the size of the smallest phones", () => {
    test.use({ viewport: NARROW });

    test("every menu item can be reached on a short screen", async ({ page }) => {
      await page.goto("/upsolve");
      await declineCookies(page);
      await page.getByTestId("nav-mobile-toggle").click();
      // A finger can only reach what the drawer lets it scroll to, so check the drawer
      // fits the screen and scrolls, rather than scrolling it from a script.
      const drawer = page.getByTestId("nav-mobile-drawer");
      await expect
        .poll(() =>
          drawer.evaluate((el) => {
            const fits = el.getBoundingClientRect().bottom <= window.innerHeight + 1;
            const reachable = el.scrollHeight <= el.clientHeight + 1 || getComputedStyle(el).overflowY === "auto";
            return fits && reachable && el.clientHeight > 300;
          }),
        )
        .toBe(true);
    });

    test("a long demo date stays on one line in the headline", async ({ page }) => {
      await page.route("**/api/upsolve/stats", async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        json.nextDemo.label = json.demos[0].label = "Saturday 30 September, 6 pm";
        await route.fulfill({ response, json });
      });
      await page.goto("/upsolve");
      await expect(page.getByTestId("upsolve-demo-date")).toContainText("30 September");
      const lines = await page.getByTestId("upsolve-demo-date").evaluate((el) => {
        const style = getComputedStyle(el);
        return Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight));
      });
      expect(lines).toBe(3);
    });
  });
});
