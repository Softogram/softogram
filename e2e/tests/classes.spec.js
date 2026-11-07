// /classes - the landing page printed on the Softogram Classes flyers as a QR
// code. One job: turn a student holding a flyer into a WhatsApp message, so the
// tests pin the two actions, the facts a student decides on (dates, fee, refund)
// and the honesty line that the page may never lose.
const { test, expect } = require("@playwright/test");

const WHATSAPP = /^https:\/\/wa\.me\/916360158761\?text=/;
const TEL = "tel:+916360158761";

test.describe("classes landing page", () => {
  test("renders inside the site chrome with the batch facts", async ({ page }) => {
    await page.goto("/classes");
    await expect(page.getByTestId("classes-page")).toBeVisible();
    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();

    await expect(page.getByTestId("classes-hero-title")).toContainText(/crack coding interviews/i);
    await expect(page.getByTestId("classes-facts")).toContainText("Monday 30 November 2026");
    await expect(page.getByTestId("classes-facts")).toContainText("7 to 9 pm");
    await expect(page.getByTestId("classes-fee-card")).toContainText("Rs 15,000");
    await expect(page.getByTestId("classes-fee-card")).toContainText("Rs 12,000");
    await expect(page.getByTestId("classes-refund")).toContainText(/full refund/i);
    await expect(page.getByTestId("classes-demo-card")).toContainText("Sunday 22 November");
  });

  test("every section's WhatsApp and call actions point at the classes number", async ({ page }) => {
    await page.goto("/classes");
    for (const where of ["hero", "demo", "school", "footer"]) {
      const wa = page.getByTestId(`classes-whatsapp-${where}`);
      await expect(wa).toHaveAttribute("href", WHATSAPP);
      await expect(wa).toHaveAttribute("target", "_blank");
      await expect(wa).toHaveAttribute("rel", /noopener/);
      await expect(page.getByTestId(`classes-call-${where}`)).toHaveAttribute("href", TEL);
    }
    // The school action asks about school classes, not the demo.
    await expect(page.getByTestId("classes-whatsapp-school")).toHaveAttribute("href", /school/);
  });

  test("syllabus lists twelve weeks and the placement section keeps the no-guarantee line", async ({ page }) => {
    await page.goto("/classes");
    await expect(page.getByTestId("classes-syllabus-list").locator("li")).toHaveCount(12);
    await expect(page.getByTestId("classes-placement-list").locator("li")).toHaveCount(5);
    // Content honesty rule: the batch has no past students, so no results and no
    // guarantee may appear. The line that says so is load-bearing.
    await expect(page.getByTestId("classes-no-guarantee")).toContainText(/no placement guarantee/i);
    await expect(page.getByTestId("classes-page")).not.toContainText(/students placed/i);
    await expect(page.getByTestId("classes-page")).not.toContainText(/testimonial/i);
  });

  test("teacher card links to real public profiles", async ({ page }) => {
    await page.goto("/classes");
    await expect(page.getByTestId("classes-teacher-card")).toContainText("Saurabh Mishra");
    await expect(page.getByTestId("classes-teacher-github")).toHaveAttribute("href", /^https:\/\/github\.com\//);
    await expect(page.getByTestId("classes-teacher-linkedin")).toHaveAttribute(
      "href",
      /^https:\/\/www\.linkedin\.com\/in\//,
    );
  });

  test("sets its own title, description and canonical (issue #80 pattern)", async ({ page }) => {
    await page.goto("/classes");
    await expect(page.getByTestId("classes-page")).toBeVisible();
    await expect(page).toHaveTitle(/Softogram Classes/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /12-week live online DSA/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://softogram.in/classes");
    const ld = await page.locator("#softogram-jsonld").textContent();
    expect(JSON.parse(ld)["@type"]).toBe("Course");
  });

  test("has exactly one main landmark and a skip link", async ({ page }) => {
    await page.goto("/classes");
    await expect(page.getByTestId("classes-page")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByTestId("skip-link")).toBeAttached();
  });
});
