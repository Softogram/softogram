/** Static product catalog seeds (Phase 5). No localStorage / admin.
 * Real products only - see issue #73. Every status must be true today:
 * "Live" means anyone can use it now; "Coming soon" means submitted to the
 * app stores but not yet downloadable. Never invent reviews or numbers.
 * imgFit: "contain" shows a square app icon whole instead of cropping it. */

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
  {
    id: "ryup",
    name: "Ryup",
    category: "Alarm Clock · Mobile App",
    desc: "An alarm clock that will not let you drift back to sleep. It rings, then asks you to actually do something - read a short story aloud, react to a joke, catch the day's headline.",
    longDesc:
      "Ryup is an alarm clock for people who switch alarms off in their sleep. When it rings, you wake yourself up properly with a short spoken activity - reading a story aloud, reacting to a joke, or catching the day's headline. Built with Flutter on the phone and a Go backend, with iOS and Android treated as equal from day one. Submitted to the app stores; not downloadable yet.",
    status: "Coming soon",
    badge: "iOS & Android",
    img: "/products/ryup-icon.png",
    imgFit: "contain",
    link: "#",
    features: [
      "Rings from a locked phone, even with the app closed",
      "A short spoken activity to get you properly awake",
      "iOS and Android, built as equals",
      "Flutter app with a Go backend",
      "In app store review",
    ],
    price: "Coming soon",
  },
  {
    id: "spicecraft",
    name: "SpiceCraft",
    category: "Puzzle Game · Mobile App",
    desc: "A sort puzzle set in a spice mill. Tap a jar, tap another, and the first jar pours its spice in. Get every jar down to a single spice.",
    longDesc:
      "SpiceCraft is a sort-puzzle game set in a spice mill. Tap one jar, then another, and the spice pours across; the goal is to leave every jar holding a single spice. Built in Unity for iOS and Android, free to play and supported by ads. Submitted to the app stores; not downloadable yet.",
    status: "Coming soon",
    badge: "iOS & Android",
    img: "/products/spicecraft-icon.png",
    imgFit: "contain",
    link: "#",
    features: [
      "Tap-to-pour sort puzzles",
      "Four puzzle twists that change the rules, not just the look",
      "Built in Unity for iOS and Android",
      "Free to play",
      "In app store review",
    ],
    price: "Free · Coming soon",
  },
];

export const PRODUCT_REVIEWS = [];
