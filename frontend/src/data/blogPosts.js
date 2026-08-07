/** Static blog seeds / offline fallback (issue #17). Prefer GET /api/content/blog. */

export const BLOG_POSTS = [
  {
    id: "polluxkart-teardown",
    title: "How we built Polluxkart",
    slug: "how-we-built-polluxkart",
    excerpt:
      "A teardown of the commerce stack we shipped for Polluxkart — architecture choices, trade-offs, and what we would redo.",
    content:
      "# How we built Polluxkart\n\nPolluxkart needed a storefront and ops tooling that could keep pace with a growing Indian commerce brand.\n\n## What we shipped\n\nCustom storefront UX, ops tooling, and incremental deploys.\n\nLive: https://polluxkart.com",
    author: "Softogram Team",
    date: "2026-07-01",
    tags: ["Case Study", "Commerce", "Engineering"],
    coverImage:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 7,
  },
  {
    id: "software-costs-india-2026",
    title: "What custom software really costs in India (2026)",
    slug: "custom-software-costs-india-2026",
    excerpt:
      "Honest ranges for MVPs, SaaS builds, and enterprise integrations — and the line items buyers forget to budget.",
    content:
      "# What custom software really costs in India (2026)\n\nBuyers keep asking for one number. Reality is a range driven by scope, integrations, and unknowns.\n\nWe quote with a written proposal: scope, assumptions, milestones, and explicit out-of-scope items.",
    author: "Softogram Team",
    date: "2026-07-15",
    tags: ["Pricing", "India", "Buying Guide"],
    coverImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 8,
  },
  {
    id: "website-vs-webapp",
    title: "Website vs web app: which does your business need?",
    slug: "website-vs-web-app",
    excerpt:
      "A practical decision guide for founders choosing between a marketing site, a web app, or a hybrid.",
    content:
      "# Website vs web app: which does your business need?\n\nIf visitors mainly read and inquire, you need a website. If users log in and do work, you need a web app. Hybrids are common.",
    author: "Softogram Team",
    date: "2026-07-22",
    tags: ["Strategy", "Product", "Founders"],
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 6,
  },
  {
    id: "launch-checklist-25",
    title: "Launch checklist: 25 things before going live",
    slug: "launch-checklist-25-things",
    excerpt:
      "A practical pre-launch checklist covering security, SEO, ops, and conversion — use it as a free lead magnet or an internal gate.",
    content:
      "# Launch checklist: 25 things before going live\n\nTLS, headers, monitors, analytics consent, unique meta, WhatsApp country code, booking CTA, case study metrics — ship when the checklist is boring.",
    author: "Softogram Team",
    date: "2026-08-01",
    tags: ["Checklist", "Launch", "Ops"],
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 9,
  },
];

export function getPublishedPosts() {
  return BLOG_POSTS.filter((p) => p.published);
}

export function getPostBySlug(slug) {
  return getPublishedPosts().find((p) => p.slug === slug) || null;
}
