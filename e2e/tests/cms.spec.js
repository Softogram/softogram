// CMS + security headers (issues #10 / #17).
const { test, expect } = require("@playwright/test");
const { BACKEND_URL } = require("../fixtures/helpers");

test.describe("CMS API", () => {
  test("public blog list returns launch posts", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/content/blog`);
    expect(res.status()).toBe(200);
    const posts = await res.json();
    expect(posts.length).toBeGreaterThanOrEqual(4);
    const slugs = posts.map((p) => p.slug);
    expect(slugs).toContain("how-we-built-polluxkart");
    expect(slugs).toContain("launch-checklist-25-things");
  });

  test("public projects include metrics case studies", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/content/projects`);
    expect(res.status()).toBe(200);
    const projects = await res.json();
    expect(projects.length).toBeGreaterThanOrEqual(2);
    expect(projects.some((p) => Array.isArray(p.metrics) && p.metrics.length > 0)).toBeTruthy();
  });

  test("admin login + save requires password", async ({ request }) => {
    const denied = await request.get(`${BACKEND_URL}/api/admin/blog`);
    expect(denied.status()).toBe(401);

    const bad = await request.post(`${BACKEND_URL}/api/admin/login`, {
      data: { password: "wrong" },
    });
    expect(bad.status()).toBe(401);

    const ok = await request.post(`${BACKEND_URL}/api/admin/login`, {
      data: { password: "e2e-admin-password" },
    });
    expect(ok.status()).toBe(200);
    const { token } = await ok.json();
    const blogs = await request.get(`${BACKEND_URL}/api/admin/blog`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(blogs.status()).toBe(200);
  });

  test("API responses include security headers (issue #10)", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/`);
    const h = res.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["strict-transport-security"]).toMatch(/max-age=/);
  });
});

test.describe("Admin UI", () => {
  test("admin login unlocks CMS", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-login")).toBeVisible();
    await page.getByTestId("admin-password").fill("e2e-admin-password");
    await page.getByTestId("admin-login-button").click();
    await expect(page.getByTestId("admin-page")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("admin-list-item").first()).toBeVisible();
  });
});
