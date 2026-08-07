// Phase 13 — comments, share UI, RSS, OG share HTML (issues #41-#45).
const { test, expect } = require("@playwright/test");
const { BACKEND_URL } = require("../fixtures/helpers");

async function adminToken(request) {
  const res = await request.post(`${BACKEND_URL}/api/admin/login`, {
    data: { password: "e2e-admin-password" },
  });
  return (await res.json()).token;
}

function e2eHeaders(id) {
  return { "X-E2E-Client-Id": id };
}

const SLUG = "how-we-built-polluxkart";

test.describe("Blog comments API (issue #42)", () => {
  test("new comments stay hidden until approved; honeypot drops silently", async ({ request }) => {
    const token = await adminToken(request);
    const marker = `e2e-comment-${Date.now()}`;

    const create = await request.post(`${BACKEND_URL}/api/content/blog/${SLUG}/comments`, {
      headers: e2eHeaders(`comment-create-${marker}`),
      data: { name: "E2E Reader", comment: marker },
    });
    expect(create.status()).toBe(200);
    expect((await create.json()).status).toBe("success");

    const publicBefore = await request.get(`${BACKEND_URL}/api/content/blog/${SLUG}/comments`);
    expect(publicBefore.status()).toBe(200);
    expect((await publicBefore.json()).some((c) => c.comment === marker)).toBe(false);

    const pending = await request.get(`${BACKEND_URL}/api/admin/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(pending.status()).toBe(200);
    const row = (await pending.json()).find((c) => c.comment === marker);
    expect(row).toBeTruthy();
    expect(row.approved).toBe(false);
    expect(row.postSlug).toBe(SLUG);

    const approve = await request.patch(`${BACKEND_URL}/api/admin/comments/${row.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { approved: true },
    });
    expect(approve.status()).toBe(200);
    expect((await approve.json()).approved).toBe(true);

    const publicAfter = await request.get(`${BACKEND_URL}/api/content/blog/${SLUG}/comments`);
    expect((await publicAfter.json()).some((c) => c.comment === marker)).toBe(true);

    // Honeypot: pretend success, never lands in the queue.
    const honeyMarker = `honey-${marker}`;
    const honey = await request.post(`${BACKEND_URL}/api/content/blog/${SLUG}/comments`, {
      headers: e2eHeaders(`comment-honey-${marker}`),
      data: {
        name: "Bot",
        comment: honeyMarker,
        company_website: "https://spam.example",
      },
    });
    expect(honey.status()).toBe(200);
    const stillPending = await request.get(`${BACKEND_URL}/api/admin/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await stillPending.json()).some((c) => c.comment === honeyMarker)).toBe(false);
  });

  test("reject deletes from the queue; unauthenticated admin is denied", async ({ request }) => {
    expect((await request.get(`${BACKEND_URL}/api/admin/comments`)).status()).toBe(401);

    const token = await adminToken(request);
    const marker = `reject-${Date.now()}`;
    await request.post(`${BACKEND_URL}/api/content/blog/${SLUG}/comments`, {
      headers: e2eHeaders(`comment-reject-${marker}`),
      data: { name: "Soon Gone", comment: marker },
    });
    const pending = await request.get(`${BACKEND_URL}/api/admin/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const row = (await pending.json()).find((c) => c.comment === marker);
    expect(row).toBeTruthy();

    const rejected = await request.patch(`${BACKEND_URL}/api/admin/comments/${row.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { approved: false },
    });
    expect(rejected.status()).toBe(200);
    expect((await rejected.json()).deleted).toBe(true);

    const after = await request.get(`${BACKEND_URL}/api/admin/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await after.json()).some((c) => c.id === row.id)).toBe(false);
  });
});

test.describe("Comment UI + admin queue (issue #43)", () => {
  test("visitor submits a comment; admin approves it from /admin", async ({ page, request }) => {
    const marker = `ui-comment-${Date.now()}`;

    await page.goto(`/blog/${SLUG}`);
    await expect(page.getByTestId("blog-post-page")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("blog-comments")).toBeVisible();

    await page.getByTestId("blog-comment-name").fill("UI Tester");
    await page.getByTestId("blog-comment-body").fill(marker);
    await page.getByTestId("blog-comment-submit").click();
    await expect(page.getByTestId("blog-comment-success")).toBeVisible();
    // Still unapproved — should not appear in the public list yet.
    await expect(page.getByTestId("blog-comment").filter({ hasText: marker })).toHaveCount(0);

    await page.goto("/admin");
    await page.getByTestId("admin-password").fill("e2e-admin-password");
    await page.getByTestId("admin-login-button").click();
    await expect(page.getByTestId("admin-page")).toBeVisible({ timeout: 10000 });
    await page.getByTestId("admin-tab-comments").click();
    await expect(page.getByTestId("admin-comments")).toBeVisible();
    const row = page.getByTestId("admin-comment-row").filter({ hasText: marker });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByTestId("admin-comment-approve").click();
    await expect(row).toHaveCount(0, { timeout: 10000 });

    await page.goto(`/blog/${SLUG}`);
    await expect(page.getByTestId("blog-post-page")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("blog-comment").filter({ hasText: marker })).toBeVisible({
      timeout: 10000,
    });

    // Cleanup via API reject path not needed — already approved. Leave as published seed noise is fine.
    void request;
  });
});

test.describe("Share buttons (issue #44)", () => {
  test("share row exposes WhatsApp, LinkedIn, X, and copy-link actions", async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);
    await expect(page.getByTestId("blog-share-row")).toBeVisible({ timeout: 15000 });

    const wa = page.getByTestId("blog-share-whatsapp");
    await expect(wa).toHaveAttribute("href", /wa\.me/);
    await expect(wa).toHaveAttribute("href", new RegExp(SLUG));

    const li = page.getByTestId("blog-share-linkedin");
    await expect(li).toHaveAttribute("href", /linkedin\.com\/sharing/);
    await expect(li).toHaveAttribute("href", new RegExp(SLUG));

    const x = page.getByTestId("blog-share-x");
    await expect(x).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
    await expect(x).toHaveAttribute("href", new RegExp(SLUG));

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByTestId("blog-share-copy").click();
    await expect(page.getByTestId("blog-share-copy")).toHaveText(/copied/i);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain(`/blog/${SLUG}`);
  });
});

test.describe("RSS feed (issue #45)", () => {
  test("RSS lists published posts and updates when a post is published via admin", async ({
    request,
  }) => {
    const token = await adminToken(request);
    const rssBefore = await request.get(`${BACKEND_URL}/api/content/blog/rss.xml`);
    expect(rssBefore.status()).toBe(200);
    expect(rssBefore.headers()["content-type"]).toMatch(/rss|xml/);
    const bodyBefore = await rssBefore.text();
    expect(bodyBefore).toContain("<rss version=\"2.0\">");
    expect(bodyBefore).toContain("<channel>");
    expect(bodyBefore).toContain(SLUG);
    expect(bodyBefore).toContain("<title>");
    expect(bodyBefore).toContain("<pubDate>");

    // Publish a unique draft via replace-all, confirm it appears, then restore.
    const blogsRes = await request.get(`${BACKEND_URL}/api/admin/blog`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blogs = await blogsRes.json();
    const tempSlug = `e2e-rss-${Date.now()}`;
    const tempPost = {
      id: `e2e-${tempSlug}`,
      title: `RSS Temp ${tempSlug}`,
      slug: tempSlug,
      excerpt: "Temporary post for RSS coverage",
      content: "# temp",
      author: "Softogram Team",
      date: new Date().toISOString().slice(0, 10),
      tags: ["e2e"],
      coverImage: "https://softogram.in/og-banner.png",
      published: true,
      readTime: 1,
    };
    const save = await request.put(`${BACKEND_URL}/api/admin/blog`, {
      headers: { Authorization: `Bearer ${token}` },
      data: [...blogs, tempPost],
    });
    expect(save.status()).toBe(200);

    const rssAfter = await request.get(`${BACKEND_URL}/api/content/blog/rss.xml`);
    expect(await rssAfter.text()).toContain(tempSlug);

    const restore = await request.put(`${BACKEND_URL}/api/admin/blog`, {
      headers: { Authorization: `Bearer ${token}` },
      data: blogs,
    });
    expect(restore.status()).toBe(200);
    expect(await (await request.get(`${BACKEND_URL}/api/content/blog/rss.xml`)).text()).not.toContain(
      tempSlug,
    );
  });

  test("blog index exposes an RSS alternate link in the document head", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByTestId("blog-page")).toBeVisible({ timeout: 15000 });
    const href = await page.locator("#softogram-rss").getAttribute("href");
    expect(href).toMatch(/\/api\/content\/blog\/rss\.xml$/);
  });
});

test.describe("OG share HTML for crawlers (issue #41)", () => {
  test("share.html returns the post title and image, not the homepage shell", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/content/blog/${SLUG}/share.html`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/text\/html/);
    const html = await res.text();

    const post = await (
      await request.get(`${BACKEND_URL}/api/content/blog/${SLUG}`)
    ).json();

    expect(html).toContain(`property="og:title"`);
    expect(html).toContain(post.title);
    expect(html).toContain(`property="og:image"`);
    // Attribute values are HTML-escaped (& -> &amp;), so match the path portion.
    expect(html).toContain("images.unsplash.com/photo-1472851294608-062f824d29cc");
    expect(html).toContain(`/blog/${SLUG}`);
    // Homepage shell title must not win.
    expect(html).not.toContain("Software that actually ships");
    void post.coverImage;
  });
});
