# Softogram Email Integration Review - July 2026

Review of the contact form to inbox pipeline, performed on 2026-07-11.

## Pipeline overview

```
Visitor -> React form (App.js ContactSection)
        -> POST https://api.softogram.in/api/contact
        -> FastAPI background task send_contact_email()
        -> SendGrid v3 mail send
        -> RECIPIENT_EMAIL inbox (support@softogram.in)
```

## Current status: BROKEN in production

The pipeline is dead at step 2.
The TLS certificate for `api.softogram.in` expired on 2026-06-09, so browsers refuse the request and the visitor sees "Failed to submit. Please try again."
No contact lead has reached the inbox since that date.
See SEC-1 in the security audit.

Everything downstream is healthy:

- The SendGrid API key in `backend/.env` is valid (verified with a read-only scopes call, HTTP 200).
- Two verified senders exist: `2bsaurabh@gmail.com` and `admin@softogram.in`.
- The backend code path returns 202-checked sends and logs failures.

## Reliability findings

### EMAIL-1: Leads are lost silently when anything fails (P0)

- `POST /api/contact` returns `{"status": "success"}` before the email is attempted (`backend/server.py:118-153`); the send runs in a background task.
- MongoDB persistence of submissions is intentionally commented out (`backend/server.py:122-135`).
- Result: if SendGrid errors, the key expires, quota runs out, or the process restarts mid-task, the lead vanishes with zero trace beyond a log line nobody watches.
- This is the second silent-loss layer on top of the cert outage.

**Fix**: persist every submission (Mongo or even an append-only JSONL fallback) before returning success, retry failed sends, and alert (email/Slack/PostHog event) when a send fails.

### EMAIL-2: Fragmented email identity across the product (P1)

| Location | Address |
|---|---|
| `backend/.env` SENDER_EMAIL | admin@softogram.in |
| `backend/.env` RECIPIENT_EMAIL | support@softogram.in |
| Site UI + policy pages (`App.js`) | support@softogram.com |
| JSON-LD structured data (`index.html`) | hello@softogram.in |
| CLAUDE.md / PRD | support@softogram.com |

- Visitors emailing the on-site address `support@softogram.com` may be writing to a domain Softogram does not operate (the live domain is `softogram.in`).
- Pick one canonical support address, update UI, policies, JSON-LD, env, and docs.

**Fix**: standardize on one address on the domain you control, and verify it as a SendGrid sender.

### EMAIL-3: Deliverability not locked down (P1)

- Only single-sender verification is set up in SendGrid.
- Without domain authentication (SPF + DKIM via SendGrid domain whitelabel) and a DMARC record on `softogram.in`, notification emails and any future auto-replies risk the spam folder.

**Fix**: authenticate the `softogram.in` domain in SendGrid, add the CNAME records, publish a DMARC policy.

### EMAIL-4: No confirmation to the lead (P2, conversion)

- The submitter gets a toast but no email confirmation.
- An auto-reply ("We received your inquiry, expect a response within 24 hours" with a booking link) improves trust and gives the lead a reply channel even if the internal notification fails.

### EMAIL-5: Injection and abuse hardening

Covered in the security audit: HTML injection into the notification body (SEC-3), no rate limiting (SEC-4), no input length limits (SEC-7).

## Testability

`send_contact_email` instantiates `SendGridAPIClient(api_key)` with the production host hardcoded.
The E2E framework introduces a `SENDGRID_HOST` env override so tests can point the backend at a local mock and assert the full browser-to-SendGrid payload without sending real email.
See `docs/testing/e2e-framework.md`.
