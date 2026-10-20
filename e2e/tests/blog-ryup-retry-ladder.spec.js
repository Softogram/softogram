// Ryup post 8 (no snooze, the backend-tuned retry ladder), added published by
// migration 0006, which also corrects one paragraph of post 1. Content comes
// from backend/content/blog_packs/.
const { test, expect } = require("@playwright/test");
const { BACKEND_URL } = require("../fixtures/helpers");
const [post] = require("../../backend/content/blog_packs/2026-10-20-ryup-retry-ladder.json");
const series = require("../../backend/content/blog_packs/2026-10-19-ryup-series.json");
const part2 = require("../../backend/content/blog_packs/2026-10-19-ryup-series-part-2.json");

const PLAY = "https://play.google.com/store/apps/details?id=com.softogram.ryup_app";
const POST_1 = series.find((p) => p.id === "ryup-01");

/** Facts read straight from the post's Markdown, so the test follows the content. */
function expectations(p) {
  const images = [...p.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));
  const tables = p.content.split("\n").filter((l) => /^\|\s*:?-/.test(l)).length; // one separator row per table
  const codeBlocks = (p.content.match(/^```/gm) || []).length / 2;
  const internal = [...new Set([...p.content.matchAll(/\]\((\/blog\/(?!ryup\/)[^)]+)\)/g)].map((m) => m[1]))];
  return { images, tables, codeBlocks, internal };
}

test.describe("Ryup post 8: the retry ladder", () => {
  test("is public: on the index, in the API, sitemap, RSS and share page", async ({ page, request }) => {
    expect(post.published).toBe(true);

    // Newer posts may sit above it, so find its card rather than assuming it is featured.
    await page.goto("/blog");
    const card = page.locator('[data-testid="blog-featured"], [data-testid="blog-card"]').filter({ hasText: post.title });
    await expect(card.getByTestId("blog-card-meta")).toContainText(
      `${post.tags[0]} · ${post.date} · ${post.readTime} min read`,
    );

    const list = await (await request.get(`${BACKEND_URL}/api/content/blog`)).json();
    expect(list.map((p) => p.slug)).toContain(post.slug);
    const sitemap = await (await request.get(`${BACKEND_URL}/api/content/sitemap.xml`)).text();
    expect(sitemap).toContain(`<loc>https://softogram.in/blog/${post.slug}</loc>`);
    const rss = await (await request.get(`${BACKEND_URL}/api/content/blog/rss.xml`)).text();
    expect(rss).toContain(`https://softogram.in/blog/${post.slug}`);
    const share = await request.get(`${BACKEND_URL}/api/content/blog/${post.slug}/share.html`);
    expect(share.status()).toBe(200);
    expect(await share.text()).toContain(`<meta property="og:image" content="https://softogram.in${post.shareImage}" />`);
  });

  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ]) {
    test(`renders fully for any visitor (${viewport.name})`, async ({ page }) => {
      const want = expectations(post);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/blog/${post.slug}`);

      await expect(page.getByTestId("blog-post-draft-banner")).toHaveCount(0);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.getByTestId("blog-post-title")).toHaveText(post.title);
      await expect(page.getByTestId("blog-post-page")).toContainText(`${post.date} · ${post.readTime} min`);

      // All three diagrams render whole, loaded, with their own alt text; the hero
      // diagram is in the body, so it is not repeated as a separate cover.
      expect(want.images).toHaveLength(3);
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
      await expect(body.locator("pre")).toHaveCount(want.codeBlocks);
      await expect(body.locator("blockquote")).toContainText("There is no expiry, deliberately");
      await expect(body.locator(`a[href="${PLAY}"]`)).toHaveAttribute("target", "_blank");
      await expect(body).not.toContainText("—");
      await expect(body).not.toContainText("| ---");

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://softogram.in/blog/${post.slug}`);
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

  test("every internal link goes to a real post in the same tab", async ({ page }) => {
    const known = new Set([...series, ...part2].map((p) => p.slug));
    const { internal } = expectations(post);
    expect(internal).toContain(`/blog/${POST_1.slug}`);
    for (const target of internal) {
      expect(known.has(target.replace("/blog/", ""))).toBe(true);
      await page.goto(`/blog/${post.slug}`);
      const link = page.getByTestId("blog-post-content").locator(`a[href="${target}"]`).first();
      await expect(link).not.toHaveAttribute("target", "_blank");
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.getByTestId("blog-post-title")).toBeVisible();
    }
  });

  test("post 1 no longer says the backend reschedules alarms, and links to post 8", async ({ page }) => {
    await page.goto(`/blog/${POST_1.slug}`);
    const body = page.getByTestId("blog-post-content");
    await expect(body).toContainText("the phone's own alarm code books the next ring");
    await expect(body).not.toContainText("the backend notices");
    await expect(body.locator("h3", { hasText: "Knowing whether you woke up" })).toBeVisible();
    await body.locator(`a[href="/blog/${post.slug}"]`).click();
    await expect(page.getByTestId("blog-post-title")).toHaveText(post.title);
  });

  test("all three diagrams and the share image are served", async ({ request }) => {
    const paths = new Set([post.shareImage, ...expectations(post).images.map((i) => i.src)]);
    expect(paths.size).toBe(4);
    for (const path of paths) expect((await request.get(path)).status(), path).toBe(200);
  });
});
