// /upsolve and /upsolve/enrol in a real browser. The flyers' QR code opens the
// first; the second is where money changes hands. Razorpay's checkout script is
// replaced by a stand-in served from fixtures/razorpay-mock.js.
const { test, expect } = require("@playwright/test");
const { BACKEND_URL, adminToken, resetEmails, resetUpsolve, RAZORPAY_MOCK_URL } = require("../fixtures/helpers");

const API = `${BACKEND_URL}/api/upsolve`;
const WHATSAPP = /^https:\/\/wa\.me\/916360158761\?text=/;

async function payAsApi(request, n) {
  const res = await request.post(`${API}/enrolments`, {
    headers: { "X-E2E-Client-Id": "upsolve-browser" },
    data: { name: `Student ${n}`, phone: `9${String(n).padStart(9, "0")}`, email: `s${n}@example.com`, plan: "full" },
  });
  const order = await res.json();
  const signed = await (await request.get(`${RAZORPAY_MOCK_URL}/sign?order_id=${order.orderId}`)).json();
  await request.post(`${API}/enrolments/${order.enrolmentId}/verify`, {
    data: { razorpay_order_id: order.orderId, razorpay_payment_id: signed.payment_id, razorpay_signature: signed.signature },
  });
}

async function fillEnrolForm(page) {
  await page.getByTestId("upsolve-enrol-name").fill("Asha Rao");
  await page.getByTestId("upsolve-enrol-phone").fill("98765 43210");
  await page.getByTestId("upsolve-enrol-email").fill("asha@example.com");
  await page.getByTestId("upsolve-enrol-college").fill("UIT Prayagraj, 3rd year");
  await page.getByTestId("upsolve-enrol-agree").check();
}

function useCheckoutMode(page, mode) {
  return page.addInitScript((m) => window.localStorage.setItem("rzp-e2e-mode", m), mode);
}

test.describe("upsolve landing page", () => {
  test.beforeEach(async ({ request }) => {
    await resetUpsolve(request);
    await resetEmails(request);
  });

  test("every section renders inside the site chrome", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
    await expect(page.getByTestId("upsolve-hero-title")).toContainText(/coach watching your code/i);
    for (const id of ["upsolve-demo", "upsolve-why", "upsolve-syllabus", "upsolve-pricing", "upsolve-teacher", "upsolve-placement", "upsolve-faq", "upsolve-final"]) {
      await expect(page.getByTestId(id)).toBeAttached();
    }
    await expect(page.getByTestId("upsolve-week")).toHaveCount(12);
    await expect(page.getByTestId("upsolve-why-card")).toHaveCount(4);
  });

  test("demo dates are the backend's upcoming ones, shown as an announcement", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-demo-date")).toContainText("1 March");
    await expect(page.getByTestId("upsolve-demo-pill")).toContainText("Sunday 1 March, 6 pm");
    await expect(page.getByTestId("upsolve-demo")).toContainText("Saturday 7 March, 6 pm");
  });

  test("the two logos each sit where their name is", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-brand").getByTestId("upsolve-mark")).toBeVisible();
    await expect(page.getByTestId("upsolve-by-softogram").getByTestId("site-logo")).toBeVisible();
  });

  test("the tagline sits under the Upsolve name and opens the page's preview text", async ({ page }) => {
    await page.goto("/upsolve");
    const tagline = page.getByTestId("upsolve-tagline");
    await expect(tagline).toHaveText("DSA is a skill you master under a mentor, not a video you watch.");
    const brand = await page.getByTestId("upsolve-brand").boundingBox();
    const line = await tagline.boundingBox();
    const pill = await page.getByTestId("upsolve-demo-pill").boundingBox();
    expect(line.y).toBeGreaterThanOrEqual(brand.y + brand.height);
    expect(line.y + line.height).toBeLessThanOrEqual(pill.y);
    // At desktop width it fits on one line, with no single word left over on a second.
    const lines = await tagline.evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(1);
    // Google and WhatsApp show this text. It must open with the same words as the hero,
    // and fit in the roughly 160 characters Google shows before cutting it off.
    const words = (await tagline.textContent()).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      await expect(page.locator(selector)).toHaveAttribute("content", new RegExp(`^${words} `));
    }
    expect((await page.locator('meta[name="description"]').getAttribute("content")).length).toBeLessThanOrEqual(160);
  });

  test("counters start honest at zero", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-counter-bookings")).toContainText("be the first");
    await expect(page.getByTestId("upsolve-counter-seats")).toContainText("0 of 10");
    await expect(page.getByTestId("upsolve-counter-early")).toContainText("5 of 5");
  });

  test("no claim the batch cannot back up", async ({ page }) => {
    await page.goto("/upsolve");
    const main = page.getByTestId("upsolve-page");
    await expect(page.getByTestId("upsolve-no-guarantee")).toContainText(/no placement guarantee/i);
    await expect(main).not.toContainText(/students placed/i);
    await expect(main).not.toContainText(/testimonial/i);
    await expect(main).not.toContainText(/\[YOUR/);
  });

  test("the public page says nothing about family or personal circumstances", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-page")).not.toContainText(/\bfamily\b|\bwife\b|\bson\b|unemployed/i);
  });

  test("the Prayagraj promise is highlighted", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-prayagraj-callout")).toContainText("from Prayagraj");
    await expect(page.getByTestId("upsolve-teacher-local")).toContainText("We meet in person");
  });

  test("the teacher card shows the cartoon portrait", async ({ page }) => {
    await page.goto("/upsolve");
    const avatar = page.getByTestId("upsolve-teacher-avatar");
    await avatar.scrollIntoViewIfNeeded();
    await expect(avatar).toHaveAttribute("alt", /cartoon portrait/i);
    await expect.poll(() => avatar.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
  });

  test("the teacher card links to the real coding profiles", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-teacher-codeforces")).toHaveAttribute("href", "https://codeforces.com/profile/saurabhmishra16");
    await expect(page.getByTestId("upsolve-teacher-leetcode")).toHaveAttribute("href", "https://leetcode.com/doodlemaster/");
    await expect(page.getByTestId("upsolve-teacher-codechef")).toHaveAttribute("href", "https://www.codechef.com/users/doodlemaster");
  });

  test("WhatsApp links are the batch number, including the floating button", async ({ page }) => {
    await page.goto("/upsolve");
    for (const id of ["upsolve-whatsapp-demo", "upsolve-whatsapp-final", "upsolve-whatsapp-school", "upsolve-whatsapp-payment"]) {
      await expect(page.getByTestId(id)).toHaveAttribute("href", WHATSAPP);
    }
    await expect(page.getByTestId("whatsapp-button")).toHaveAttribute("href", /demo%20class/);
    await expect(page.getByTestId("lead-magnet-trigger")).toHaveCount(0);
  });

  test("sets its own title, canonical and course data", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-page")).toBeVisible();
    await expect(page).toHaveTitle(/Upsolve by Softogram/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://softogram.in/upsolve");
    const ld = await page.locator("#softogram-jsonld").textContent();
    expect(JSON.parse(ld)["@type"]).toBe("Course");
  });

  test("has one main landmark and a skip link", async ({ page }) => {
    await page.goto("/upsolve");
    await expect(page.getByTestId("upsolve-page")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByTestId("skip-link")).toBeAttached();
  });

  test("nav links to the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("nav-link-upsolve").first()).toHaveAttribute("href", "/upsolve");
  });

  test.describe("booking a demo seat", () => {
    test("shows errors next to the fields and sends nothing", async ({ page }) => {
      await page.goto("/upsolve");
      await page.getByTestId("upsolve-booking-submit").click();
      await expect(page.getByTestId("upsolve-name-error")).toBeVisible();
      await expect(page.getByTestId("upsolve-phone-error")).toBeVisible();
    });

    test("a student books, the counter moves, and the booking is on the admin tab", async ({ page, request }) => {
      await page.goto("/upsolve");
      await expect(page.getByTestId("upsolve-booking-demo-2099-03-07")).toBeVisible();
      await page.getByTestId("upsolve-booking-name").fill("Asha Rao");
      await page.getByTestId("upsolve-booking-phone").fill("98765 43210");
      await page.getByTestId("upsolve-booking-college").fill("UIT Prayagraj");
      await page.getByTestId("upsolve-booking-year").selectOption("3rd year");
      await page.getByTestId("upsolve-booking-demo-2099-03-07").check();
      await page.getByTestId("upsolve-booking-submit").click();

      await expect(page.getByTestId("upsolve-booking-success")).toContainText("Saturday 7 March, 6 pm");
      await expect(page.getByTestId("upsolve-counter-bookings")).toContainText("1");

      const token = await adminToken(request);
      await page.addInitScript((t) => window.sessionStorage.setItem("softogram_admin_token", t), token);
      await page.goto("/admin");
      await page.getByTestId("admin-tab-upsolve").click();
      const row = page.getByTestId("admin-upsolve-booking-row");
      await expect(row).toHaveCount(1);
      await expect(row).toContainText("Asha Rao");
      await expect(row).toContainText("9876543210");
      await expect(row).toContainText("2099-03-07");
      await expect(page.getByTestId("admin-upsolve-tile-new")).toContainText("1");

      await page.getByTestId("admin-upsolve-meet-link").fill("https://meet.google.com/abc-defg-hij");
      await expect(page.getByTestId("admin-upsolve-send-link")).toHaveAttribute("href", /wa\.me\/919876543210\?.*meet\.google\.com/);

      await page.getByTestId("admin-upsolve-booking-status").selectOption("attended");
      await expect
        .poll(async () => (await (await request.get(`${BACKEND_URL}/api/admin/upsolve/bookings`, { headers: { Authorization: `Bearer ${token}` } })).json())[0].status)
        .toBe("attended");
    });
  });

  test.describe("enrol and pay", () => {
    test("pricing links to the enrol page", async ({ page }) => {
      await page.goto("/upsolve");
      await page.getByTestId("upsolve-enrol-link").click();
      await expect(page).toHaveURL(/\/upsolve\/enrol$/);
      await expect(page.getByTestId("upsolve-enrol-pay")).toContainText("Rs 12,000");
    });

    test("states who collects the fee", async ({ page }) => {
      await page.goto("/upsolve/enrol");
      await expect(page.getByTestId("upsolve-enrol-form")).toContainText("Saurabh Mishra as an individual tutor");
    });

    test("validates before any payment starts", async ({ page, request }) => {
      await page.goto("/upsolve/enrol");
      await page.getByTestId("upsolve-enrol-pay").click();
      await expect(page.getByTestId("enrol-name-error")).toBeVisible();
      await expect(page.getByTestId("enrol-phone-error")).toBeVisible();
      await expect(page.getByTestId("enrol-email-error")).toBeVisible();
      await expect(page.getByTestId("enrol-agree-error")).toBeVisible();
      const orders = await (await request.get(`${RAZORPAY_MOCK_URL}/orders`)).json();
      expect(orders).toHaveLength(0);
    });

    test("choosing instalments changes what the button charges", async ({ page }) => {
      await page.goto("/upsolve/enrol");
      await page.getByTestId("upsolve-plan-instalment").check();
      await expect(page.getByTestId("upsolve-enrol-pay")).toContainText("Rs 6,000");
    });

    test("a successful payment shows the seat, updates the page and appears in admin", async ({ page, request }) => {
      await page.goto("/upsolve/enrol");
      await expect(page.getByTestId("upsolve-enrol-seats")).toContainText("0");
      await fillEnrolForm(page);
      await page.getByTestId("upsolve-enrol-pay").click();

      await expect(page.getByTestId("upsolve-success-title")).toHaveText("You are in. Seat 1 of 10.");
      await expect(page.getByTestId("upsolve-success-receipt")).toHaveText("UPS-0001");
      await expect(page.getByTestId("upsolve-success-payment-id")).toContainText("pay_e2e");

      await page.goto("/upsolve");
      await expect(page.getByTestId("upsolve-counter-seats")).toContainText("1 of 10");
      await expect(page.getByTestId("upsolve-counter-early")).toContainText("4 of 5");

      const token = await adminToken(request);
      await page.addInitScript((t) => window.sessionStorage.setItem("softogram_admin_token", t), token);
      await page.goto("/admin");
      await page.getByTestId("admin-tab-upsolve").click();
      await expect(page.getByTestId("admin-upsolve-enrolment-row")).toContainText("Asha Rao");
      await expect(page.getByTestId("admin-upsolve-tile-seats")).toContainText("1 of 10");
      await expect(page.getByTestId("admin-upsolve-tile-collected")).toContainText("12,000");
    });

    test("closing the payment window charges nothing and takes no seat", async ({ page, request }) => {
      await useCheckoutMode(page, "dismiss");
      await page.goto("/upsolve/enrol");
      await fillEnrolForm(page);
      await page.getByTestId("upsolve-enrol-pay").click();
      await expect(page.getByTestId("upsolve-enrol-notice")).toContainText("nothing was charged");
      await expect(page.getByTestId("upsolve-enrol-pay")).toBeEnabled();
      expect((await (await request.get(`${API}/stats`)).json()).seatsTaken).toBe(0);
    });

    test("a tampered confirmation is refused and takes no seat", async ({ page, request }) => {
      await useCheckoutMode(page, "tampered");
      await page.goto("/upsolve/enrol");
      await fillEnrolForm(page);
      await page.getByTestId("upsolve-enrol-pay").click();
      await expect(page.getByTestId("upsolve-enrol-failure")).toContainText("could not confirm");
      expect((await (await request.get(`${API}/stats`)).json()).seatsTaken).toBe(0);
    });

    test("if our confirmation call fails after payment, the student is told not to pay again", async ({ page }) => {
      await page.route("**/api/upsolve/enrolments/*/verify", (route) => route.abort());
      await page.goto("/upsolve/enrol");
      await fillEnrolForm(page);
      await page.getByTestId("upsolve-enrol-pay").click();
      await expect(page.getByTestId("upsolve-enrol-unverified")).toContainText("Do not pay again");
      await expect(page.getByTestId("upsolve-enrol-pay")).toBeDisabled();
    });

    test("if the last early-bird seat goes mid-form, checkout does not open at a surprise price", async ({ page, request }) => {
      await page.goto("/upsolve/enrol");
      await expect(page.getByTestId("upsolve-enrol-pay")).toContainText("Rs 12,000");
      for (let n = 1; n <= 5; n += 1) await payAsApi(request, n);
      await fillEnrolForm(page);
      await page.getByTestId("upsolve-enrol-pay").click();
      await expect(page.getByTestId("upsolve-enrol-notice")).toContainText("Rs 15,000");
      await expect(page.getByTestId("upsolve-enrol-pay")).toContainText("Rs 15,000");
      await expect(page.getByTestId("upsolve-enrol-success")).toHaveCount(0);
    });

    test("a full batch offers the waitlist instead of a pay button", async ({ page, request }) => {
      for (let n = 1; n <= 10; n += 1) await payAsApi(request, n);
      await page.goto("/upsolve/enrol");
      await expect(page.getByTestId("upsolve-enrol-full")).toBeVisible();
      await expect(page.getByTestId("upsolve-enrol-pay")).toHaveCount(0);
      await page.goto("/upsolve");
      await expect(page.getByTestId("upsolve-batch-full")).toBeVisible();
    });

    test("before Razorpay keys are configured, the page offers WhatsApp", async ({ page, request }) => {
      const real = await (await request.get(`${API}/stats`)).json();
      await page.route("**/api/upsolve/stats", (route) =>
        route.fulfill({ json: { ...real, paymentsEnabled: false }, headers: { "access-control-allow-origin": "*" } }),
      );
      await page.goto("/upsolve/enrol");
      await expect(page.getByTestId("upsolve-enrol-closed")).toBeVisible();
      await expect(page.getByTestId("upsolve-enrol-whatsapp")).toHaveAttribute("href", WHATSAPP);
    });
  });

  test.describe("admin tab, students who enrol over WhatsApp", () => {
    test.beforeEach(async ({ page, request }) => {
      const token = await adminToken(request);
      await page.addInitScript((t) => window.sessionStorage.setItem("softogram_admin_token", t), token);
      await page.goto("/admin");
      await page.getByTestId("admin-tab-upsolve").click();
      await expect(page.getByTestId("admin-upsolve-enrolments-empty")).toBeVisible();
      await page.getByTestId("admin-upsolve-student-name").fill("WhatsApp Student");
      await page.getByTestId("admin-upsolve-student-phone").fill("9123456789");
      await page.getByTestId("admin-upsolve-student-email").fill("wa@example.com");
    });

    test("creates a payment link ready to send", async ({ page }) => {
      await page.getByTestId("admin-upsolve-create-link").click();
      await expect(page.getByTestId("admin-upsolve-new-link")).toContainText("rzp.io");
      await expect(page.getByTestId("admin-upsolve-new-link-send")).toHaveAttribute("href", /wa\.me\/919123456789/);
      await expect(page.getByTestId("admin-upsolve-enrolment-row")).toContainText("WhatsApp Student");
    });

    test("records a UPI transfer as a paid seat", async ({ page }) => {
      await page.getByTestId("admin-upsolve-record-upi").click();
      await expect(page.getByTestId("admin-upsolve-tile-seats")).toContainText("1 of 10");
      await expect(page.getByTestId("admin-upsolve-enrolment-status")).toHaveValue("paid");
    });
  });
});
