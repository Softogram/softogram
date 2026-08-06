## Goal
Align E2E suite + CI with the redesigned UI. Delivers / advances #18.

## Work
1. Update all Playwright selectors/`data-testid` expectations for redesign
2. Remove obsolete cyan-era assertions
3. Add `.github/workflows/e2e.yml` if not present (#18)
4. Ensure contact E2E still uses SendGrid mock

## Acceptance
- [ ] `cd e2e && npm test` green on redesign
- [ ] CI workflow runs on PR (closes #18 when fully done)
