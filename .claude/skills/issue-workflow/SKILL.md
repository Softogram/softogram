---
name: issue-workflow
description: Pick up, implement, and close Softogram GitHub issues (Softogram/softogram). Use when asked to "work on an issue", "pick the next issue", "fix issue #N", or to triage the backlog. Covers issue selection order, branch/PR conventions, repo-specific fix guidance, and the E2E verification gate.
---

# Softogram issue workflow

How to pick up and land a GitHub issue in this repo.
Read root `CLAUDE.md` first for stack, brand, and code conventions.

## 1. Pick an issue

```bash
npx -y gh-axi issue list --repo=Softogram/softogram          # full backlog
npx -y gh-axi issue view <n> --repo=Softogram/softogram      # details
```

Selection order:

1. `P0` before `P1` before `P2`.
2. Prefer `agent-ready` labels: those are self-contained with acceptance criteria and need no infra/dashboard access.
3. Issues labeled `ops` (TLS renewal, DNS, AWS console, monitoring signup) need human access to servers/accounts; do the code-side parts and list the human steps in the PR description.
4. Issues labeled `deferred` are intentionally parked and gated on something else; do not pick them up without being asked.

If the user names an issue, skip selection and go to step 2.

## 2. Understand before coding

- Every issue links its audit/plan doc: `docs/audit/security-audit-2026-07.md`, `docs/audit/email-integration-2026-07.md`, `docs/growth/growth-plan-2026-07.md`.
Read the linked section, it carries evidence and context the issue summarizes.
- Reproduce the problem first (project rule): for backend issues use the E2E harness in `e2e/` (AWS SES mock included); for UI issues run the app and see the bug at the width the issue names before changing anything.

## 3. Implement

- Branch from `development` (the default branch, not `main` - `main` is production and protected): `fix/issue-<n>-<slug>` or `feat/issue-<n>-<slug>`.
- Respect repo conventions: minimal diffs, no TypeScript/Next.js, `data-testid` on every new interactive element, GitHub-dark green brand preserved (never reintroduce cyan).
- New pages go in `frontend/src/pages/`, shared sections in `frontend/src/components/redesign/`. `App.js` is a router only; do not grow it.
- Backend email path: never block the HTTP response on SES; keep the `AWS_SES_ENDPOINT_URL` override intact (the E2E suite points it at `e2e/fixtures/ses-mock.js`).
- Never print, commit, or paste secrets. SES uses the AWS credential chain, not a key in `.env`.
- Never invent testimonials, client names, metrics, or shipped-project claims. See the content-honesty rule in `CLAUDE.md`.

## 4. Verify (mandatory gate)

```bash
cd e2e && npm test          # full stack: SES mock + backend + frontend + Playwright
python backend_test.py      # legacy API tests (point at local backend)
```

- Add or extend an E2E/API test that captures the issue's acceptance criteria; most issues list the expected test explicitly.
- Fix any lint/test failure you encounter, even if unrelated (project rule).

## 5. Land it

- Commit with a plain message describing the change; no co-author lines.
- Open a PR into `development` (not `main`) that links the issue (`Closes #<n>`), lists acceptance criteria as checkboxes with their status, and calls out any human-only steps (DNS records, dashboard toggles, cert renewal) that remain.
- If the issue is only partially completable from code, keep it open and comment what remains.
