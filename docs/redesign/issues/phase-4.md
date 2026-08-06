## Goal
Finish Home (Shipped + Services) and **wire Contact form to FastAPI** `POST /api/contact`.

## Source
Home shipped + services sections; existing Softogram contact contract in `backend/server.py` + current form fields

## Work
1. Port Shipped cards + Services rows
2. Wire form: `name`, `email`, `phone` (add phone — required by backend), `service` (from type chips or select), `message`
3. Map redesign type chips (`custom`/`saas`/`ai`/`tooling`) into `service` strings the API accepts
4. Success/error toasts; reset form on success
5. E2E full contact path against SendGrid mock must pass
6. Note: production leads still depend on #1 (TLS) and #2 (CORS)

## Acceptance
- [ ] Full home page matches redesign section set
- [ ] Contact E2E green with mock SendGrid capturing email
- [ ] No localStorage-only fake submit left on production path

## Labels intent
P0, redesign, email, growth, agent-ready
