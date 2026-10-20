// The five-part SpiceCraft series, added published by migration 0007. Content
// comes from backend/content/blog_packs/2026-10-21-spicecraft-series.json.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { BACKEND_URL } = require("../fixtures/helpers");
const series = require("../../backend/content/blog_packs/2026-10-21-spicecraft-series.json");

const PLAY = "https://play.google.com/store/apps/details?id=com.softogram.spicecraft";
const PACKS = path.join(__dirname, "../../backend/content/blog_packs");
const everySlug = new Set(
  fs
    .readdirSync(PACKS)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(PACKS, f), "utf8")).map((p) => p.slug)),
);

/** Facts read straight from each post's Markdown, so the test follows the content. */
function expectations(post) {
  const images = [...post.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));
  const tables = post.content.split("\n").filter((l) => /^\|\s*:?-/.test(l)).length; // one separator row per table
  const codeBlocks = (post.content.match(/^```/gm) || []).length / 2;
  const internal = [
    ...new Set([...post.content.matchAll(/\]\((\/blog\/(?!ryup\/|spicecraft\/)[^)]+)\)/g)].map((m) => m[1])),
  ];
  return { images, tables, codeBlocks, internal };
}

test.describe("SpiceCraft blog series", () => {
  test("all five are public, newest, and listed in series order", async ({ page, request }) => {
    expect(series).toHaveLength(5);
    for (const post of series) expect(post.published).toBe(true);

    // Newest first, and posts sharing a date keep id order, so part 1 is featured.
    await page.goto("/blog");
    await expect(page.getByTestId("blog-featured")).toContainText(series[0].title);
    const cards = await page.getByTestId("blog-card").locator("h3").allTextContents();
    expect(cards.slice(0, 4)).toEqual(series.slice(1).map((p) => p.title));
    await expect(page.getByTestId("blog-featured").getByTestId("blog-card-meta")).toContainText(
      `${series[0].tags[0]} · ${series[0].date} · ${series[0].readTime} min read`,
    );

    const list = await (await request.get(`${BACKEND_URL}/api/content/blog`)).json();
    expect(list.slice(0, 5).map((p) => p.slug)).toEqual(series.map((p) => p.slug));
    const sitemap = await (await request.get(`${BACKEND_URL}/api/content/sitemap.xml`)).text();
    const rss = await (await request.get(`${BACKEND_URL}/api/content/blog/rss.xml`)).text();
    for (const post of series) {
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
    for (const post of series) {
      test(`${post.slug} renders fully (${viewport.name})`, async ({ page }) => {
        const want = expectations(post);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`/blog/${post.slug}`);

        await expect(page.getByTestId("blog-post-draft-banner")).toHaveCount(0);
        await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
        await expect(page.getByTestId("blog-post-title")).toHaveText(post.title);
        await expect(page.getByTestId("blog-post-page")).toContainText(`${post.date} · ${post.readTime} min`);

        // Every diagram renders whole, loaded, with its own alt text; the hero is in
        // the body, so it is not repeated as a separate cover.
        expect(want.images.length).toBeGreaterThan(0);
        expect(want.images.map((i) => i.src)).toContain(post.coverImage);
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
        await expect(body.locator(`a[href="${PLAY}"]`)).toHaveAttribute("target", "_blank");
        await expect(body).not.toContainText("—");
        await expect(body).not.toContainText("| ---");

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

  test("every internal link goes to a real post in the same tab", async ({ page }) => {
    for (const post of series) {
      const { internal } = expectations(post);
      expect(internal.length).toBeGreaterThan(0);
      for (const target of internal) {
        expect(everySlug.has(target.replace("/blog/", ""))).toBe(true);
        await page.goto(`/blog/${post.slug}`);
        const link = page.getByTestId("blog-post-content").locator(`a[href="${target}"]`).first();
        await expect(link).not.toHaveAttribute("target", "_blank");
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${target}$`));
        await expect(page.getByTestId("blog-post-title")).toBeVisible();
      }
    }
  });

  test("all ten diagrams and five share images are served", async ({ request }) => {
    const paths = new Set();
    for (const post of series) {
      paths.add(post.shareImage);
      for (const { src } of expectations(post).images) paths.add(src);
    }
    expect(paths.size).toBe(15);
    for (const p of paths) expect((await request.get(p)).status(), p).toBe(200);
  });
});
