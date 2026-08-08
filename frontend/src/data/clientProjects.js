/** Static client-work seeds / offline fallback (issue #17). */

export const INDUSTRIES = ["All", "Retail", "Gaming", "Open Source"];

export const CLIENT_PROJECTS = [
  {
    id: "polluxkart",
    client: "Polluxkart",
    title: "Commerce experience rebuild",
    desc: "Custom storefront and ops tooling for a growing Indian commerce brand.",
    industry: "Retail",
    services: ["E-commerce", "Custom Development"],
    outcome: "Live storefront with continuous shipping; mobile-first conversion focus.",
    metrics: [
      { label: "Storefront", value: "Live" },
      { label: "Focus", value: "Mobile checkout" },
    ],
    img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=500&fit=crop&auto=format",
    year: "2024",
    published: true,
    url: "https://polluxkart.com",
  },
  {
    id: "syn-grid",
    client: "Softogram Games",
    title: "Syn-Grid — mobile auto-battler",
    desc: "Server-authoritative inventory-management auto-battler for mobile. Every game value — grid positions, item stats, gold, combat outcomes — is computed and enforced server-side; a compromised client can only affect cosmetics.",
    industry: "Gaming",
    services: ["Game Backend", "Go", "gRPC", "Godot"],
    outcome: "In active development. Go/gRPC backend on Postgres + Redis, Godot 4 client for Android/iOS.",
    metrics: [
      { label: "Backend", value: "Go + gRPC" },
      { label: "Client", value: "Godot 4" },
    ],
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=500&fit=crop&auto=format",
    year: "2026",
    published: true,
    url: "https://github.com/Softogram/syn-grid",
  },
  {
    id: "search-to-md",
    client: "Softogram Open Source",
    title: "search-to-md",
    desc: "Free, open-source CLI that turns a web search into clean, source-attributed Markdown built for an AI agent to read directly — no HTML stripping or citation-wrangling required.",
    industry: "Open Source",
    services: ["CLI", "Go", "AI Tooling"],
    outcome: "v0.1.0 released — Tavily-powered search-to-Markdown pipeline.",
    metrics: [
      { label: "Language", value: "Go" },
      { label: "Release", value: "v0.1.0" },
    ],
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&auto=format",
    year: "2026",
    published: true,
    url: "https://github.com/Softogram/softogram-search-to-markdown",
  },
  {
    id: "mcp-checker",
    client: "Softogram Open Source",
    title: "mcp-migration-checker",
    desc: "Go CLI that scans MCP server implementations against spec changes.",
    industry: "Open Source",
    services: ["CLI", "Static Analysis", "CI"],
    outcome: "Cross-platform binary published via GitHub Actions — v0.1.1.",
    metrics: [
      { label: "Language", value: "Go" },
      { label: "Release", value: "v0.1.1" },
    ],
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop&auto=format",
    year: "2025",
    published: true,
    url: "https://github.com/Softogram/softogram-mcp-spec-migration-checker",
  },
];
