// Admin dashboard v2: leads pipeline, image upload, analytics (Phase 12 / issues #38-#40).
const path = require("path");
const { test, expect } = require("@playwright/test");
const { BACKEND_URL } = require("../fixtures/helpers");

async function adminToken(request) {
  const res = await request.post(`${BACKEND_URL}/api/admin/login`, {
    data: { email: "admin@example.com", password: "e2e-admin-password" },
  });
  return (await res.json()).token;
}

function e2eHeaders(id) {
  return { "X-E2E-Client-Id": id };
}

test.describe("Leads pipeline (issue #38)", () => {
  test("submitted lead appears in admin list and status updates persist", async ({ request }) => {
    const token = await adminToken(request);
    const email = `admin-leads-${Date.now()}@example.com`;

    const submit = await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("admin-leads-test"),
      data: {
        name: "Leads Tab Test",
        email,
        phone: "+91-9000000002",
        service: "Custom Software",
        message: "Testing the admin leads tab",
      },
    });
    expect(submit.status()).toBe(200);

    const list = await request.get(`${BACKEND_URL}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.status()).toBe(200);
    const leads = await list.json();
    const lead = leads.find((l) => l.email === email);
    expect(lead).toBeTruthy();
    expect(lead.status).toBe("new");

    const patch = await request.patch(`${BACKEND_URL}/api/admin/leads/${lead.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "contacted" },
    });
    expect(patch.status()).toBe(200);
    expect((await patch.json()).status).toBe("contacted");

    const relist = await request.get(`${BACKEND_URL}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = (await relist.json()).find((l) => l.id === lead.id);
    expect(updated.status).toBe("contacted");
  });

  test("invalid status is rejected and unauthenticated access is denied", async ({ request }) => {
    const token = await adminToken(request);

    const noAuth = await request.get(`${BACKEND_URL}/api/admin/leads`);
    expect(noAuth.status()).toBe(401);

    const list = await request.get(`${BACKEND_URL}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const leads = await list.json();
    expect(leads.length).toBeGreaterThan(0);

    const bad = await request.patch(`${BACKEND_URL}/api/admin/leads/${leads[0].id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: "bogus" },
    });
    expect(bad.status()).toBe(422);
  });
});

test.describe("Image upload (issue #39)", () => {
  test("admin can upload an image and it's servable; non-images are rejected", async ({ request }) => {
    const token = await adminToken(request);

    const upload = await request.post(`${BACKEND_URL}/api/admin/upload`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        file: {
          name: "test.png",
          mimeType: "image/png",
          buffer: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            "base64",
          ),
        },
      },
    });
    expect(upload.status()).toBe(200);
    const { url } = await upload.json();
    expect(url).toMatch(/^\/uploads\/.+\.png$/);

    const fetched = await request.get(`${BACKEND_URL}${url}`);
    expect(fetched.status()).toBe(200);

    const rejected = await request.post(`${BACKEND_URL}/api/admin/upload`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        file: { name: "test.txt", mimeType: "text/plain", buffer: Buffer.from("not an image") },
      },
    });
    expect(rejected.status()).toBe(415);
  });

  test("upload requires admin auth", async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/admin/upload`, {
      multipart: { file: { name: "x.png", mimeType: "image/png", buffer: Buffer.from("") } },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Analytics (issue #40)", () => {
  test("analytics endpoint combines Postgres metrics and reports PostHog as not connected", async ({ request }) => {
    const token = await adminToken(request);
    const res = await request.get(`${BACKEND_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.leadsOverTime)).toBe(true);
    expect(Array.isArray(data.leadsByStatus)).toBe(true);
    expect(Array.isArray(data.topPosts)).toBe(true);
    expect(data.topPosts.length).toBeGreaterThanOrEqual(1);
    // No POSTHOG_API_KEY is set in the E2E env - must degrade gracefully, not error.
    expect(data.posthogConnected).toBe(false);
    expect(data.posthog).toBeNull();
  });
});

test.describe("Admin UI (leads + analytics tabs)", () => {
  test("leads tab lists submissions and lets the admin change status", async ({ page, request }) => {
    const email = `admin-ui-leads-${Date.now()}@example.com`;
    await request.post(`${BACKEND_URL}/api/contact`, {
      headers: e2eHeaders("admin-ui-leads-test"),
      data: {
        name: "Admin UI Leads Test",
        email,
        phone: "+91-9000000003",
        service: "Custom Software",
        message: "Testing the leads tab UI",
      },
    });

    await page.goto("/admin");
    await page.getByTestId("admin-email").fill("admin@example.com");
    await page.getByTestId("admin-password").fill("e2e-admin-password");
    await page.getByTestId("admin-login-button").click();
    await expect(page.getByTestId("admin-page")).toBeVisible({ timeout: 10000 });

    await page.getByTestId("admin-tab-leads").click();
    await expect(page.getByTestId("admin-leads")).toBeVisible();
    const row = page.getByTestId("admin-lead-row").filter({ hasText: email });
    await expect(row).toBeVisible({ timeout: 10000 });

    await row.getByTestId("admin-lead-status").selectOption("won");
    await page.waitForTimeout(500);
    const list = await request.get(`${BACKEND_URL}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${await adminToken(request)}` },
    });
    const lead = (await list.json()).find((l) => l.email === email);
    expect(lead.status).toBe("won");
  });

  test("analytics tab renders without PostHog configured", async ({ page }) => {
    await page.goto("/admin");
    await page.getByTestId("admin-email").fill("admin@example.com");
    await page.getByTestId("admin-password").fill("e2e-admin-password");
    await page.getByTestId("admin-login-button").click();
    await expect(page.getByTestId("admin-page")).toBeVisible({ timeout: 10000 });

    await page.getByTestId("admin-tab-analytics").click();
    await expect(page.getByTestId("admin-analytics")).toBeVisible();
    await expect(page.getByTestId("admin-posthog-not-connected")).toBeVisible({ timeout: 10000 });
  });

  test("blog editor shows a live markdown preview", async ({ page }) => {
    await page.goto("/admin");
    await page.getByTestId("admin-email").fill("admin@example.com");
    await page.getByTestId("admin-password").fill("e2e-admin-password");
    await page.getByTestId("admin-login-button").click();
    await expect(page.getByTestId("admin-page")).toBeVisible({ timeout: 10000 });

    await page.getByTestId("admin-tab-blog").click();
    await page.getByTestId("admin-list-item").first().click();
    await expect(page.getByTestId("admin-blog-editor")).toBeVisible();

    const content = page.getByTestId("admin-blog-content");
    await content.fill("# Preview check\n\nHello **world**.");
    await expect(page.getByTestId("admin-blog-preview").getByText("Preview check")).toBeVisible();
    await expect(page.getByTestId("admin-blog-preview").locator("strong")).toHaveText("world");
  });
});
