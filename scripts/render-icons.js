/**
 * Renders every raster icon and the social share banner from
 * frontend/public/favicon.svg, so the mark exists in exactly one place.
 *
 *   cd e2e && npm ci            # once, for Playwright's Chromium
 *   node ../scripts/render-icons.js
 *   python3 scripts/make-ico.py # packs favicon.ico from the 16 and 32px PNGs
 *
 * Why Chromium and not an image library: the mark uses evenodd fills and
 * round line caps, and Chromium is the renderer the site is judged in.
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const PUBLIC = path.resolve(__dirname, "../frontend/public");
const svg = fs.readFileSync(path.join(PUBLIC, "favicon.svg"), "utf8");

// The mark without its square background, for the banner.
const MARK = svg
  .replace(/<rect[^>]*\/>/, "")
  .replace("<svg ", '<svg width="208" height="208" ');

const ICONS = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["softogram-logo.png", 512],
];

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Outfit:wght@400&display=swap";

const BANNER = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; background: #09090e; }
  body { display: flex; align-items: center; justify-content: center; gap: 56px;
         color: #e2e8f0; font-family: Outfit, sans-serif; }
  svg { display: block; flex: none; filter: drop-shadow(0 0 14px rgba(74, 222, 128, 0.45)); }
  h1 { margin: 0; font-family: Fraunces, serif; font-weight: 600; font-size: 104px;
       line-height: 1; letter-spacing: -0.02em; color: #4ade80; }
  p  { margin: 18px 0 0; font-size: 40px; font-weight: 400; color: #e2e8f0; }
</style></head>
<body>
  ${MARK}
  <div><h1>Softogram</h1><p>Your idea. Our code. Delivered.</p></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  for (const [file, size] of ICONS) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<style>html,body{margin:0;background:#0d1117}svg{display:block}</style>` +
        svg.replace("<svg ", `<svg width="${size}" height="${size}" `)
    );
    await page.screenshot({ path: path.join(PUBLIC, file), clip: { x: 0, y: 0, width: size, height: size } });
    console.log("wrote", file);
  }

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(BANNER, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(PUBLIC, "og-banner.png") });
  console.log("wrote og-banner.png");

  await browser.close();
})();
