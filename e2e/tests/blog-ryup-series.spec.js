// The five-part "how we built Ryup" series (diagram covers, internal links,
// link previews). Content comes from backend/content/blog_packs/.
const { test, expect } = require("@playwright/test");
const pack = require("../../backend/content/blog_packs/2026-10-19-ryup-series.json");

const API = process.env.BACKEND_URL || "http://localhost:8001";
const PLAY = "https://play.google.com/store/apps/details?id=com.softogram.ryup_app";

test.describe("Ryup blog series", () => {
  test("the index lists all five, newest first, with category, date and reading time", async ({ page }) => {
    await page.goto("/blog");
    // Newest first: the series (2026-10-19) is newer than every seed post, and posts
    // sharing a date keep series order, so part 1 is the featured post.
    await expect(page.getByTestId("blog-featured")).toContainText(pack[0].title);
    const cardTitles = await page.getByTestId("blog-card").locator("h3").allTextContents();
    expect(cardTitles.slice(0, 4)).toEqual(pack.slice(1).map((p) => p.title));

    const meta = page.getByTestId("blog-card-meta");
    await expect(meta.first()).toContainText(`${pack[0].tags[0]} · ${pack[0].date} · ${pack[0].readTime} min read`);
    await expect(meta.nth(1)).toContainText(`${pack[1].tags[0]} · ${pack[1].date} · ${pack[1].readTime} min read`);
  });

  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ]) {
    for (const post of pack) {
      test(`${post.slug} renders fully (${viewport.name})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`/blog/${post.slug}`);

        await expect(page.getByTestId("blog-post-title")).toHaveText(post.title);
        await expect(page.getByTestId("blog-post-page")).toContainText(post.tags[0]);
        await expect(page.getByTestId("blog-post-page")).toContainText(`${post.date} · ${post.readTime} min`);

        // The diagram is shown whole, with its own alt text, and actually loaded.
        const diagram = page.getByTestId("blog-post-diagram").getByRole("img", { name: post.coverAlt });
        await expect(diagram).toBeVisible();
        expect(await diagram.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
        // Never squeezed below a readable width; on a phone it scrolls sideways instead.
        expect((await diagram.boundingBox()).width).toBeGreaterThanOrEqual(720);
        await expect(page.getByTestId("blog-post-diagram-open")).toHaveAttribute("href", post.coverImage);

        // Body: headings and lists render as real elements, and the Play link is there.
        const body = page.getByTestId("blog-post-content");
        await expect(body.locator("h3").first()).toBeVisible();
        await expect(body.locator(`a[href="${PLAY}"]`)).toHaveAttribute("target", "_blank");
        await expect(body).not.toContainText("\u2014");

        // The page as a whole does not scroll sideways on a phone; only the diagram does.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);

        // SEO set by the page itself.
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
        expect(article.description).toBe(post.excerpt);
        expect(article.datePublished).toBe(post.date);
        expect(article.author.name).toBe("Softogram");
      });
    }
  }

  test("every internal link goes to a real post in the same tab", async ({ page }) => {
    const slugs = new Set(pack.map((p) => p.slug));
    for (const post of pack) {
      const targets = [...post.content.matchAll(/\]\((\/blog\/[^)]+)\)/g)].map((m) => m[1]);
      expect(targets.length).toBeGreaterThan(0);
      for (const target of targets) {
        expect(slugs.has(target.replace("/blog/", ""))).toBe(true);
        await page.goto(`/blog/${post.slug}`);
        const link = page.getByTestId("blog-post-content").locator(`a[href="${target}"]`);
        await expect(link).not.toHaveAttribute("target", "_blank");
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${target}$`));
        await expect(page.getByTestId("blog-post-title")).toBeVisible();
      }
    }
  });

  test("diagrams and share images are served", async ({ request }) => {
    for (const post of pack) {
      for (const path of [post.coverImage, post.shareImage]) {
        const res = await request.get(path);
        expect(res.status(), path).toBe(200);
      }
    }
  });

  test("crawler preview page has absolute PNG image, Twitter card and BlogPosting", async ({ request }) => {
    for (const post of pack) {
      const html = await (await request.get(`${API}/api/content/blog/${post.slug}/share.html`)).text();
      const image = `https://softogram.in${post.shareImage}`;
      expect(html).toContain(`<meta property="og:image" content="${image}" />`);
      expect(html).toContain(`<meta name="twitter:image" content="${image}" />`);
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(html).toContain(`<link rel="canonical" href="https://softogram.in/blog/${post.slug}" />`);
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      expect(ld["@type"]).toBe("BlogPosting");
      expect(ld.author.name).toBe("Softogram");
    }
  });

  test("sitemap and RSS include every post", async ({ request }) => {
    const sitemap = await (await request.get(`${API}/api/content/sitemap.xml`)).text();
    const rss = await (await request.get(`${API}/api/content/blog/rss.xml`)).text();
    expect(sitemap).toContain("<loc>https://softogram.in/blog</loc>");
    for (const post of pack) {
      expect(sitemap).toContain(`<loc>https://softogram.in/blog/${post.slug}</loc>`);
      expect(rss).toContain(`https://softogram.in/blog/${post.slug}`);
    }
  });
});
