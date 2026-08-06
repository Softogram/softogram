/** Static blog seeds (Phase 7). No localStorage / admin. */

export const BLOG_POSTS = [
  {
    id: "1",
    title: "Building AI Agents that Actually Work in Production",
    slug: "building-ai-agents-production",
    excerpt:
      "Most AI agent demos fail when they hit the real world. Here is what we learned shipping AgentKit to 200+ organizations.",
    content: `# Building AI Agents that Actually Work in Production

Most AI agent demos fail when they hit the real world. The gap between a compelling demo and a production-grade system is enormous. After shipping AgentKit to over 200 organizations, here is what we learned.

## The Demo Problem

Every AI agent looks great when the inputs are clean, the APIs are up, and the tasks are simple. Real production environments are messier. Users ask unexpected things, third-party tools go down, and LLM outputs are non-deterministic.

## What We Built Differently

The key insight was treating agent workflows like distributed systems — with retries, fallbacks, circuit breakers, and observability built in from day one.

### 1. Structured tool definitions
Every tool gets a schema, a timeout, and a fallback. No exceptions.

### 2. Checkpoint-based memory
Agents store intermediate state so they can resume after failures without restarting from scratch.

### 3. Human-in-the-loop gates
For high-stakes actions, we pause and route to a human approver. This alone reduced errors by 73%.

## Results

After implementing these patterns, our agent runtime handles 40,000+ tasks per day with a 99.2% success rate. The remaining failures are surfaced immediately with full replay capability.`,
    author: "Softogram Team",
    date: "2025-07-15",
    tags: ["AI", "Agents", "Engineering"],
    coverImage:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 8,
  },
  {
    id: "2",
    title: "Why We Chose Fraunces for Our Brand Typography",
    slug: "fraunces-brand-typography",
    excerpt:
      "The typeface decision that shaped our entire visual identity — and the reasoning behind committing to an unusual serif.",
    content: `# Why We Chose Fraunces for Our Brand Typography

Typography is the first thing people feel about a brand, even before they process the words. When we redesigned Softogram, the typeface decision was the most consequential one we made.

## The Problem with "Safe" Choices

Inter and Outfit are excellent type systems. They are also on 40% of SaaS homepages. We wanted something that would make a reader stop and feel something.

## Discovering Fraunces

Fraunces is a variable font designed specifically to evoke warmth and personality while retaining legibility at display sizes. The optical size axis means it gets more decorative at large sizes and more readable at small ones — perfect for a brand that needs both a striking hero headline and functional body copy.

## The Italic Makes it

The real magic is the italic. It is not just slanted — it has distinct letterforms that feel handwritten and confident at the same time. We use it for emphasis, and it immediately signals that we take craft seriously.`,
    author: "Design Team",
    date: "2025-06-28",
    tags: ["Design", "Typography", "Brand"],
    coverImage:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 5,
  },
  {
    id: "3",
    title: "How We Reduced Onboarding Time from 3 Weeks to 4 Hours",
    slug: "reducing-onboarding-time",
    excerpt:
      "The architectural decisions behind FlowDesk that cut enterprise onboarding from weeks to hours.",
    content: `# How We Reduced Onboarding Time from 3 Weeks to 4 Hours

Enterprise software has a dirty secret: most of the "implementation time" is not technical work. It is data mapping, user training, and permission configuration that should be automated.

## The Old Way

Most enterprise tools require a professional services engagement just to get started. That means weeks of back-and-forth before a customer sees any value.

## What We Did Instead

We built FlowDesk with a configuration-first architecture. Every setup step is observable, reversible, and automatable.

### Auto-discovery
FlowDesk scans connected tools and suggests data mappings with 94% accuracy. What used to take a consultant three days takes an algorithm three minutes.

### Progressive permission model
Instead of requiring full admin access upfront, FlowDesk operates with minimal permissions and requests more only when needed — with a clear explanation each time.

### Instant value demo
Within 20 minutes of connecting their first inbox, new users see their first AI-generated response suggestion. Seeing value early is the best onboarding.`,
    author: "Product Team",
    date: "2025-06-10",
    tags: ["Product", "SaaS", "UX"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&auto=format",
    published: true,
    readTime: 6,
  },
];

export function getPublishedPosts() {
  return BLOG_POSTS.filter((p) => p.published);
}

export function getPostBySlug(slug) {
  return getPublishedPosts().find((p) => p.slug === slug) || null;
}
