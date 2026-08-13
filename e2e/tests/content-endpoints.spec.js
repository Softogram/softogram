// CMS-generated sitemap (#78) and the server-side GitHub stats proxy (#99).
const { test, expect } = require("@playwright/test");
const { urls } = require("../playwright.config");

const API = `${urls.BACKEND_URL}/api`;

test.describe("sitemap.xml from the CMS (issue #78)", () => {
  test("lists every static route and every published post", async ({ request }) => {
    const res = await request.get(`${API}/content/sitemap.xml`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");

    const xml = await res.text();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    for (const path of [
      "/",
      "/products",
      "/client-work",
      "/blog",
      "/privacy-policy",
      "/terms-and-conditions",
      "/refund-policy",
      "/cookie-policy",
    ]) {
      expect(xml, `missing static route ${path}`).toContain(
        `<loc>https://softogram.in${path}</loc>`
      );
    }

    // The point of the issue: posts come from the CMS, so publishing one is the
    // only step needed for it to appear here.
    const posts = await (await request.get(`${API}/content/blog`)).json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(xml, `post ${post.slug} missing from sitemap`).toContain(
        `<loc>https://softogram.in/blog/${post.slug}</loc>`
      );
    }

    // Every <url> must carry a <loc>; a malformed entry invalidates the document.
    const urlCount = (xml.match(/<url>/g) || []).length;
    const locCount = (xml.match(/<loc>/g) || []).length;
    expect(urlCount).toBe(locCount);
    expect(urlCount).toBe(8 + posts.length);
  });

  test("is well-formed XML", async ({ request }) => {
    const xml = await (await request.get(`${API}/content/sitemap.xml`)).text();
    // No unescaped bare ampersands - the usual way a generated sitemap breaks.
    expect(xml).not.toMatch(/&(?!(amp|lt|gt|quot|apos|#\d+);)/);
    expect((xml.match(/<url>/g) || []).length).toBe((xml.match(/<\/url>/g) || []).length);
  });
});

test.describe("GitHub repo stats proxy (issue #99)", () => {
  const ALLOWED = "Softogram/softogram-mcp-spec-migration-checker";

  test("returns 200 with a stats shape for an allowed repo", async ({ request }) => {
    const res = await request.get(`${API}/content/repo-stats?repo=${encodeURIComponent(ALLOWED)}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("stats");

    // stats may be null: CI runners share IPs, so GitHub can rate-limit this
    // unauthenticated call. That is exactly the failure this endpoint exists to
    // absorb, so a null payload is a pass - what must never happen is an error
    // status reaching the browser.
    if (body.stats !== null) {
      expect(body.stats.repo).toBe(ALLOWED);
      expect(typeof body.stats.stars === "number" || body.stats.stars === null).toBe(true);
    }
  });

  test("rejects repositories that are not on the allowlist", async ({ request }) => {
    // Without an allowlist this would be an open forwarder to any GitHub repo,
    // attributable to our IP and our token.
    for (const repo of ["torvalds/linux", "../../etc/passwd", "Softogram/../evil"]) {
      const res = await request.get(`${API}/content/repo-stats?repo=${encodeURIComponent(repo)}`);
      expect(res.status(), `${repo} should not be proxied`).toBe(404);
    }
  });

  test("second request is served from cache", async ({ request }) => {
    await request.get(`${API}/content/repo-stats?repo=${encodeURIComponent(ALLOWED)}`);
    const res = await request.get(`${API}/content/repo-stats?repo=${encodeURIComponent(ALLOWED)}`);
    expect((await res.json()).cached).toBe(true);
  });
});

test.describe("the homepage no longer calls GitHub directly (issue #99)", () => {
  test("no browser request reaches api.github.com", async ({ page }) => {
    const githubRequests = [];
    page.on("request", (r) => {
      if (r.url().includes("api.github.com")) githubRequests.push(r.url());
    });

    await page.goto("/");
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await page.waitForTimeout(2500); // the stats fetch runs in an effect after mount

    expect(githubRequests).toEqual([]);
  });
});
