/** Static product catalog seeds (Phase 5). No localStorage / admin. */

export const PRODUCTS = [
  {
    id: "1",
    name: "FlowDesk",
    category: "SaaS · Productivity",
    desc: "A unified inbox and workflow automation platform for customer-facing teams. Reduces support response time by 60%.",
    longDesc:
      "FlowDesk brings every customer conversation — email, chat, social — into a single intelligent workspace. AI drafts responses, routes tickets, and escalates edge cases automatically. Teams ship faster, customers wait less.",
    status: "Live",
    badge: "Flagship",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format",
    link: "https://github.com/Softogram/softogram-mcp-spec-migration-checker",
    features: [
      "Unified inbox",
      "AI response drafting",
      "Smart routing",
      "SLA tracking",
      "Integrations with 50+ tools",
    ],
    price: "$49/mo per seat",
  },
  {
    id: "2",
    name: "AgentKit",
    category: "AI · Developer Tool",
    desc: "SDK and cloud runtime for deploying LLM-powered agents with tool-use, memory, and orchestration out of the box.",
    longDesc:
      "AgentKit gives engineers a production-ready foundation for LLM agents — with structured tool definitions, checkpoint memory, human-in-the-loop approvals, and a hosted runtime that scales from prototype to 40k tasks/day.",
    status: "Beta",
    badge: "AI-native",
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=500&fit=crop&auto=format",
    link: "https://github.com/Softogram",
    features: [
      "Multi-model support",
      "Checkpoint memory",
      "Tool registry",
      "Human approval gates",
      "Full observability",
    ],
    price: "$0.01 / task · $99/mo platform",
  },
  {
    id: "3",
    name: "DataPulse",
    category: "SaaS · Analytics",
    desc: "Real-time business intelligence dashboards with natural language querying. Connect to any database in minutes.",
    longDesc:
      "DataPulse turns raw database tables into living dashboards. Ask questions in plain English and get charts, tables, and insights — no SQL required. Connect Postgres, MySQL, BigQuery, or any REST API.",
    status: "Live",
    badge: "NL-querying",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format",
    link: "https://softogram.in/client-work",
    features: [
      "Natural language querying",
      "Real-time updates",
      "10+ database connectors",
      "Embeddable widgets",
      "Role-based access",
    ],
    price: "$29/mo per workspace",
  },
];

export const PRODUCT_REVIEWS = [
  {
    id: "1",
    productId: "1",
    author: "Sarah Chen",
    role: "Head of Support, Meridian Health",
    rating: 5,
    text: "FlowDesk cut our average response time from 4 hours to 18 minutes. The AI drafts are scary-good — we approve 80% of them without edits.",
    date: "2025-07-20",
    approved: true,
  },
  {
    id: "2",
    productId: "2",
    author: "Marcus Webb",
    role: "CTO, Fieldworks AI",
    rating: 5,
    text: "We went from zero to a production agent handling 5,000 tasks/day in three weeks. AgentKit handled all the hard parts.",
    date: "2025-06-30",
    approved: true,
  },
  {
    id: "3",
    productId: "3",
    author: "Priya Nair",
    role: "VP Analytics, Corvo Capital",
    rating: 5,
    text: 'I asked DataPulse "which clients are most likely to churn?" and got a ranked list with supporting charts in 8 seconds. Remarkable.',
    date: "2025-07-05",
    approved: true,
  },
];
