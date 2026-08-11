/** Static product catalog seeds (Phase 5). No localStorage / admin.
 * Real, shipped open-source tools only - see issue #73. */

export const PRODUCTS = [
  {
    id: "search-to-md",
    name: "search-to-md",
    category: "CLI · Open Source",
    desc: "Free, open-source CLI that turns a web search into clean, source-attributed Markdown built for an AI agent to read directly - no HTML stripping or citation-wrangling required.",
    longDesc:
      "search-to-md is a Tavily-powered search-to-Markdown pipeline: run a query, get back clean, source-attributed Markdown an LLM can read directly instead of parsing raw HTML or wrangling citations by hand. Written in Go, single binary, no runtime dependencies.",
    status: "Live",
    badge: "Open Source",
    img: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&h=500&fit=crop&auto=format",
    link: "https://github.com/Softogram/softogram-search-to-markdown",
    features: [
      "Tavily-powered web search",
      "Clean, source-attributed Markdown output",
      "Single Go binary, no runtime deps",
      "Built for feeding AI agents directly",
      "v0.1.0 released 2026-08-07",
    ],
    price: "Free & open source",
  },
  {
    id: "mcp-migration-checker",
    name: "MCP Migration Checker",
    category: "Static Analysis · Open Source",
    desc: "Cross-platform static analysis tool that scans an MCP server's tool/resource specifications for common spec violations and drift.",
    longDesc:
      "MCP Migration Checker scans a Model Context Protocol server's tool and resource specifications for common spec violations, catching drift before it breaks clients. Cross-platform binary published via GitHub Actions - v0.1.1 shipped the same day as a glibc compatibility fix.",
    status: "Live",
    badge: "Open Source",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop&auto=format",
    link: "https://github.com/Softogram/softogram-mcp-spec-migration-checker",
    features: [
      "Scans MCP server specs for violations",
      "Catches spec drift after protocol updates",
      "Cross-platform binary (Linux/macOS/Windows)",
      "CI-friendly, scriptable output",
      "v0.1.1 released",
    ],
    price: "Free & open source",
  },
];

export const PRODUCT_REVIEWS = [];
