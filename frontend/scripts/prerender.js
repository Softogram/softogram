#!/usr/bin/env node
/**
 * Write a per-route index.html with correct meta tags (issue #80).
 *
 * `SeoHead` sets title, description and canonical inside a useEffect, so they
 * only exist after React mounts. Anything reading raw HTML - link checkers, SEO
 * crawlers, first-pass fetches, `curl` - saw byte-identical markup on every
 * route, including a canonical pointing at the homepage from every subpage.
 *
 * This runs after `react-scripts build` and stamps the real values into a copy
 * of index.html per route, so the served HTML already carries them. React still
 * boots normally and re-applies the same values, which is a no-op because they
 * come from the same routeMeta.json.
 *
 * Only static marketing routes are handled. Blog posts are CMS content whose
 * metadata is not known at build time; those already have the Lambda@Edge
 * share.html path for crawlers.
 *
 * Serving these files requires the edge function to rewrite `/products` to
 * `/products/index.html`, since CloudFront's S3 origin does not resolve
 * directory indexes on its own. Until that is deployed these files sit unused
 * in the bucket and every route behaves exactly as it does today - this is
 * additive, not a cutover.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const INDEX = path.join(BUILD_DIR, "index.html");
const SITE_ORIGIN = "https://softogram.in";

const { routes } = require(path.join(__dirname, "..", "src", "data", "routeMeta.json"));

/** Escape for use inside a double-quoted HTML attribute. */
function attr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape for use as HTML text content. */
function text(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Replace a tag if present, otherwise insert it before </head>.
 * The base index.html already carries a homepage title, description and
 * canonical, so these are replacements in practice - but a template change
 * should not silently drop the tag.
 */
function upsert(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace("</head>", `        ${replacement}\n    </head>`);
}

function renderRoute(baseHtml, route, meta) {
  const canonical = `${SITE_ORIGIN}${route}`;
  let html = baseHtml;

  html = upsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${text(meta.title)}</title>`);
  html = upsert(
    html,
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${attr(meta.description)}" />`
  );
  html = upsert(
    html,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${attr(canonical)}" />`
  );

  // Open Graph and Twitter matter for link previews, which never run JS at all.
  html = upsert(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${attr(meta.title)}" />`);
  html = upsert(html, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${attr(meta.description)}" />`);
  html = upsert(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${attr(canonical)}" />`);
  html = upsert(html, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${attr(meta.title)}" />`);
  html = upsert(html, /<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${attr(meta.description)}" />`);

  return html;
}

/**
 * Read each file back and confirm the tags actually landed.
 *
 * The substitutions are regex-based against a template this repo does not own -
 * CRA generates index.html, and a future version reformatting a tag would make
 * a pattern silently miss. Without this check that failure looks like a
 * successful build while quietly shipping the homepage's canonical on every
 * route, which is the exact bug being fixed. Fail the build instead.
 */
function verify(route, file, meta) {
  const html = fs.readFileSync(file, "utf8");
  const problems = [];

  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!title || title[1] !== text(meta.title)) {
    problems.push(`title is ${title ? `"${title[1]}"` : "missing"}, expected "${text(meta.title)}"`);
  }

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const expectedCanonical = attr(`${SITE_ORIGIN}${route}`);
  if (!canonical || canonical[1] !== expectedCanonical) {
    problems.push(`canonical is ${canonical ? `"${canonical[1]}"` : "missing"}, expected "${expectedCanonical}"`);
  }

  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!description || description[1] !== attr(meta.description)) {
    problems.push("description did not match");
  }

  // More than one <title> means a substitution inserted rather than replaced,
  // and browsers would take the first one.
  const titleCount = (html.match(/<title>/gi) || []).length;
  if (titleCount !== 1) problems.push(`found ${titleCount} <title> tags, expected exactly 1`);

  return problems;
}

function main() {
  if (!fs.existsSync(INDEX)) {
    console.error(`prerender: ${INDEX} not found - run react-scripts build first.`);
    process.exit(1);
  }
  const baseHtml = fs.readFileSync(INDEX, "utf8");

  const failures = [];
  let written = 0;

  for (const [route, meta] of Object.entries(routes)) {
    const html = renderRoute(baseHtml, route, meta);

    let file;
    if (route === "/") {
      // The homepage is served from the bucket root, so it overwrites index.html
      // rather than creating a directory.
      file = INDEX;
    } else {
      const dir = path.join(BUILD_DIR, route.replace(/^\//, ""));
      fs.mkdirSync(dir, { recursive: true });
      file = path.join(dir, "index.html");
    }
    fs.writeFileSync(file, html);

    const problems = verify(route, file, meta);
    if (problems.length) {
      failures.push(`  ${route}:\n    - ${problems.join("\n    - ")}`);
    } else {
      written += 1;
      console.log(`prerender: ${route} -> ${meta.title}`);
    }
  }

  if (failures.length) {
    console.error(
      `\nprerender: ${failures.length} route(s) did not get correct metadata.\n` +
        `The index.html template has probably changed shape.\n\n${failures.join("\n")}\n`
    );
    process.exit(1);
  }

  console.log(`prerender: wrote and verified ${written} route(s)`);
}

main();
