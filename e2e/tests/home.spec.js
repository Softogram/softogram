// Landing page smoke: redesign Home (Phases 2–4).
const { test, expect } = require("@playwright/test");

test.describe("landing page", () => {
  test("redesign hero, mid sections, and contact render", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("hero-cta-quote")).toBeVisible();
    await expect(page.getByTestId("hero-headline")).toContainText(/ships/i);

    // Phase 3
    await expect(page.getByTestId("terminal-section")).toBeVisible();
    await expect(page.getByTestId("terminal-widget")).toBeVisible();
    await expect(page.getByTestId("terminal-run")).toBeVisible();
    await expect(page.getByTestId("build-log-section")).toBeVisible();
    await expect(page.getByTestId("build-log-row").first()).toBeVisible();

    // Phase 4
    await expect(page.getByTestId("shipped-section")).toBeVisible();
    await expect(page.getByTestId("shipped-card").first()).toBeVisible();
    await expect(page.getByTestId("services-section")).toBeVisible();
    await expect(page.getByTestId("service-row").first()).toBeVisible();

    await expect(page.getByTestId("contact-section")).toBeAttached();
  });

  test("terminal run reveals demo output", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("terminal-section").scrollIntoViewIfNeeded();
    const widget = page.getByTestId("terminal-widget");
    await widget.getByTestId("terminal-run").click();
    await expect(widget.getByText("exit 0", { exact: true })).toBeVisible({ timeout: 15000 });
  });

  test("build log row expands detail", async ({ page }) => {
    await page.goto("/");
    const section = page.getByTestId("build-log-section");
    await section.scrollIntoViewIfNeeded();
    const row = page.getByTestId("build-log-row").first();
    await row.evaluate((el) => {
      el.scrollIntoView({ block: "center", inline: "nearest" });
      el.click();
    });
    await expect(page.getByTestId("build-log-detail").first()).toBeVisible();
  });

  // WhatsApp float was part of the old home; redesign home omits it for now.
  test.fixme("WhatsApp floating button is present and links to WhatsApp (deferred)", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByTestId("whatsapp-button");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("href", /wa\.me/);
  });

  test.fixme("WhatsApp link uses full international number (issue #12)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("whatsapp-button")).toHaveAttribute("href", /wa\.me\/91\d{10}/);
  });
});
