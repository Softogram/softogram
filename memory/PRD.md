# Softogram Website - PRD

> Technical architecture, file map, and agent memory: see [`memory/PROJECT.md`](./PROJECT.md).
> Agent briefing: see [`CLAUDE.md`](../CLAUDE.md) at repo root.

## Original Problem Statement
Build a premium, dark-themed website for Softogram software company with:
- Brand Identity: Pure black (#000000), cyan (#00F5FF), violet (#7C3AED) accents
- Tagline: "Your idea. Our code. Delivered."
- Fonts: Space Grotesk (headings), Inter (body)
- Style: Dark glassmorphism, neon glow effects, dot pattern background
- Sections: Hero, Stats, Services (8), Pricing, Portfolio, Testimonials, Why Choose Us, Contact, Footer
- Contact form with SendGrid email integration + Budget Range dropdown
- WhatsApp floating button

## User Personas
1. **SMB Owners** - Small/medium business owners in India looking for software development services
2. **Startup Founders** - Tech-savvy founders needing custom web applications
3. **E-commerce Merchants** - Business owners looking for online stores
4. **Enterprise Clients** - Companies needing AI automation, game development, enterprise tools

## Core Requirements (Static)
- Premium dark theme with futuristic aesthetic
- Responsive design for all devices
- Smooth scroll navigation
- Glassmorphism cards with cyan neon glow on hover
- Contact form with email notification + budget range
- WhatsApp quick contact option

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: FastAPI with PostgreSQL (SQLAlchemy async + Alembic)
- **Email**: SendGrid (configurable via environment variables)

## What's Been Implemented
### December 2025 - v2 (Premium Dark Theme)
- [x] Premium pure black design with cyan/violet accents
- [x] Hero with dot pattern background and typing code animation
- [x] Stats counter with 4 metrics (15+ projects, 10+ clients, 3+ years, 100%)
- [x] Services grid expanded to 8 services (added Game Dev, AI Automation, Enterprise Tools, Scalability)
- [x] Pricing cards with "Most Popular" cyan glow badge
- [x] Portfolio grid (3 projects with tech tags)
- [x] Testimonials marquee with avatar initials
- [x] Why Choose Us (4 features)
- [x] Contact form with Budget Range dropdown + SendGrid integration
- [x] WhatsApp floating button with pulse animation
- [x] Glassmorphism navbar with sticky behavior
- [x] Footer with gradient border top
- [x] Space Grotesk + Inter fonts
- [x] Backend API: POST /api/contact

### December 2025 - v3 (Case Studies + Policy Pages)
- [x] New redesigned logo with abstract S shape and cyan "gram" highlight
- [x] Fixed navbar gap from top (top-6)
- [x] Case Studies section with Polluxkart deep dive
- [x] Architecture breakdown: Frontend, API Gateway, Microservices, Database Layer, Infrastructure
- [x] Tech stack display: React.js, FastAPI, Node.js, PostgreSQL, Redis, Docker, AWS, GitHub Actions
- [x] Instagram and Facebook social icons added
- [x] Privacy Policy page (/privacy-policy)
- [x] Terms & Conditions page (/terms-and-conditions)
- [x] Refund Policy page (/refund-policy)
- [x] Cookie Policy page (/cookie-policy)
- [x] Footer Legal column with all policy links
- [x] Policy pages with dark theme and cyan left border on headings

## Environment Variables
```
# Backend (.env)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDER_EMAIL=support@softogram.com
RECIPIENT_EMAIL=support@softogram.com
```

## Prioritized Backlog

### P0 - Critical (For Production)
- [ ] Add actual SendGrid API key for email notifications
- [ ] Update placeholder phone numbers
- [ ] Add real social media URLs

### P1 - Important
- [ ] Add SEO meta tags (title, description, OG tags)
- [ ] Add favicon and site icons
- [ ] Implement actual project links in portfolio
- [ ] Add Google Analytics integration

### P2 - Nice to Have
- [ ] Add loading states/skeleton screens
- [ ] Implement blog section (route exists with static placeholder cards; needs CMS or MD pipeline)
- [ ] Add cookie consent banner
- [ ] Add live chat widget (Intercom/Drift)
- [ ] Implement dark/light mode toggle

## Next Tasks
1. Configure SendGrid API key for production
2. Update contact phone number and WhatsApp number
3. Add actual social media profile URLs
4. Implement SEO optimizations
5. Add Google Analytics tracking
