// Ryup posts 6 and 7 (scoring engine, recommendations): added as posts by
// migration 0004, published by 0005. Also covers the admin draft preview.
// Content comes from backend/content/blog_packs/.
const { test, expect } = require("@playwright/test");
const { BACKEND_URL, adminToken } = require("../fixtures/helpers");
const posts = require("../../backend/content/blog_packs/2026-10-19-ryup-series-part-2.json");
const published = require("../../backend/content/blog_packs/2026-10-19-ryup-series.json");

const PLAY = "https://play.google.com/store/apps/details?id=com.softogram.ryup_app";

/** Facts read straight from each post's Markdown, so the test follows the content. */
function expectations(post) {
  const images = [...post.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));
  const tables = post.content.split("\n").filter((l) => /^\|\s*:?-/.test(l)).length; // one separator row per table
  const codeBlocks = (post.content.match(/^```/gm) || []).length / 2;
  const internal = [...new Set([...post.content.matchAll(/\]\((\/blog\/(?!ryup\/)[^)]+)\)/g)].map((m) => m[1]))];
  return { images, tables, codeBlocks, internal };
}

async function signInAsAdmin(page, request) {
  const token = await adminToken(request);
  await page.addInitScript((t) => sessionStorage.setItem("softogram_admin_token", t), token);
}

test.describe("Ryup posts 6 and 7", () => {
  test("both posts are public: index, API, sitemap, RSS and share page", async ({ page, request }) => {
    for (const post of posts) expect(post.published).toBe(true);

    await page.goto("/blog");
    for (const post of posts) await expect(page.getByTestId("blog-page")).toContainText(post.title);

    const list = await (await request.get(`${BACKEND_URL}/api/content/blog`)).json();
    const sitemap = await (await request.get(`${BACKEND_URL}/api/content/sitemap.xml`)).text();
    const rss = await (await request.get(`${BACKEND_URL}/api/content/blog/rss.xml`)).text();
    for (const post of posts) {
      expect(list.map((p) => p.slug)).toContain(post.slug);
      expect(sitemap).toContain(`<loc>https://softogram.in/blog/${post.slug}</loc>`);
      expect(rss).toContain(`https://softogram.in/blog/${post.slug}`);
      const share = await request.get(`${BACKEND_URL}/api/content/blog/${post.slug}/share.html`);
      expect(share.status()).toBe(200);
      expect(await share.text()).toContain(
        `<meta property="og:image" content="https://softogram.in${post.shareImage}" />`,
      );
    }
  });

  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ]) {
    for (const post of posts) {
      test(`${post.slug} renders fully for any visitor (${viewport.name})`, async ({ page }) => {
        const want = expectations(post);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`/blog/${post.slug}`);

        await expect(page.getByTestId("blog-post-draft-banner")).toHaveCount(0);
        await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
        await expect(page.getByTestId("blog-post-title")).toHaveText(post.title);
        await expect(page.getByTestId("blog-post-page")).toContainText(post.tags[0]);
        await expect(page.getByTestId("blog-post-page")).toContainText(`${post.date} · ${post.readTime} min`);

        // Every diagram in the body renders whole, loaded, with its own alt text, and
        // the hero diagram is not shown a second time as a separate cover.
        expect(want.images.length).toBeGreaterThan(0);
        await expect(page.getByTestId("blog-post-diagram")).toHaveCount(0);
        const figures = page.getByTestId("blog-body-diagram");
        await expect(figures).toHaveCount(want.images.length);
        for (const [i, image] of want.images.entries()) {
          const img = figures.nth(i).locator("img");
          await expect(img).toHaveAttribute("src", image.src);
          await expect(img).toHaveAttribute("alt", image.alt);
          await img.scrollIntoViewIfNeeded();
          await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
          expect((await img.boundingBox()).width).toBeGreaterThanOrEqual(720);
        }

        const body = page.getByTestId("blog-post-content");
        await expect(body.locator("table")).toHaveCount(want.tables);
        await expect(body.locator("th").first()).toBeVisible();
        await expect(body.locator("pre")).toHaveCount(want.codeBlocks);
        await expect(body.locator("h3").first()).toBeVisible();
        await expect(body.locator(`a[href="${PLAY}"]`)).toHaveAttribute("target", "_blank");
        await expect(body).not.toContainText("\u2014");
        await expect(body).not.toContainText("| ---"); // no table left as raw Markdown

        // Only the diagrams and tables scroll sideways on a phone, never the page.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);

        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          `https://softogram.in/blog/${post.slug}`,
        );
        await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", post.excerpt);
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
          "content",
          `https://softogram.in${post.shareImage}`,
        );
        const ld = JSON.parse(await page.locator("#softogram-jsonld").textContent());
        const article = ld.find((x) => x["@type"] === "BlogPosting");
        expect(article.headline).toBe(post.title);
        expect(article.author.name).toBe("Softogram");
      });
    }
  }

  test("every internal link in the posts works, in the same tab", async ({ page }) => {
    const known = new Set([...posts, ...published].map((p) => p.slug));
    for (const post of posts) {
      const { internal } = expectations(post);
      expect(internal).toContain(
        post.slug === "how-ryup-scores-your-morning-scoring-engine"
          ? "/blog/how-ryup-recommends-your-morning-content"
          : "/blog/how-ryup-scores-your-morning-scoring-engine",
      );
      for (const target of internal) {
        expect(known.has(target.replace("/blog/", ""))).toBe(true);
        await page.goto(`/blog/${post.slug}`);
        const link = page.getByTestId("blog-post-content").locator(`a[href="${target}"]`).first();
        await expect(link).not.toHaveAttribute("target", "_blank");
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${target}$`));
        await expect(page.getByTestId("blog-post-title")).toBeVisible();
      }
    }
  });

  test("all seven diagrams and both share images are served", async ({ request }) => {
    const paths = new Set();
    for (const post of posts) {
      paths.add(post.shareImage);
      for (const { src } of expectations(post).images) paths.add(src);
    }
    expect(paths.size).toBe(9);
    for (const path of paths) expect((await request.get(path)).status(), path).toBe(200);
  });

  test("draft preview: an unpublished post is visible only to a signed-in admin", async ({ page, request }) => {
    const token = await adminToken(request);
    const headers = { Authorization: `Bearer ${token}` };
    const original = await (await request.get(`${BACKEND_URL}/api/admin/blog`, { headers })).json();
    const draft = {
      ...posts[0],
      id: "e2e-draft-preview",
      slug: "e2e-draft-preview",
      title: "E2E draft preview",
      published: false,
    };
    try {
      expect((await request.put(`${BACKEND_URL}/api/admin/blog`, { headers, data: [...original, draft] })).ok()).toBe(true);

      await page.goto(`/blog/${draft.slug}`);
      await expect(page.getByTestId("blog-post-not-found")).toBeVisible();
      expect((await request.get(`${BACKEND_URL}/api/content/blog/${draft.slug}`)).status()).toBe(404);

      await signInAsAdmin(page, request);
      await page.goto(`/blog/${draft.slug}`);
      await expect(page.getByTestId("blog-post-draft-banner")).toContainText("Draft preview, not public");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
      await expect(page.getByTestId("blog-post-title")).toHaveText(draft.title);
    } finally {
      await request.put(`${BACKEND_URL}/api/admin/blog`, { headers, data: original });
    }
  });
});
