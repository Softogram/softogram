# E2E testing framework

The repo has a full end-to-end test framework under `e2e/`, built on Playwright.
Operational details and commands: [`e2e/README.md`](../../e2e/README.md).

## Design decisions

- **Real stack, mocked boundary**: tests run the real React app and the real FastAPI server; only the external SendGrid API is mocked, at the HTTP boundary.
This follows the project rule of reproducing behavior as an end user experiences it.
- **`SENDGRID_HOST` override**: `backend/server.py` honors an optional `SENDGRID_HOST` env var so the SendGrid client can be pointed at the local mock.
Production behavior is unchanged when the variable is unset.
- **Email payload assertions**: because the mock captures the exact `/v3/mail/send` body, tests verify subject, reply-to, recipients, and HTML content, which is the actual deliverable of the contact pipeline.
- **Known bugs are encoded as `test.fixme`**: open issues (#2, #4, #12, #13, #19) have failing-by-design tests checked in but skipped, so fixing an issue means flipping one word and gaining permanent regression coverage.
The suite proved this pattern on its first run: it caught the blank-404 defect that became issue #19.
- **Dedicated ports** (3100/8001/8025) so the suite never collides with a running dev environment.

## Relationship to existing tests

- `backend_test.py` (requests-based API tests) still works and targets a deployed URL; the e2e suite supersedes it for local and CI verification.
- CI integration is tracked in issue #18 (`.github/workflows/e2e.yml`).

## Definition of done for any code change

1. `cd e2e && npm test` passes.
2. New interactive UI has `data-testid` attributes and a covering test.
3. Bug fixes flip or add a test that fails before the fix and passes after.
