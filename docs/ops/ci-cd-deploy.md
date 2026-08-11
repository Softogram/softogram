# CI/CD deploy pipeline (issues #64, #65)

Pushing to `main` now deploys automatically. Manual deploy (see `docs/ops/deploy-to-prod.md`,
local-only, not tracked in git) is the fallback if a workflow needs to be bypassed.

## Frontend - `.github/workflows/deploy-frontend.yml`

Triggers on push to `main` touching `frontend/**`, or manually via `workflow_dispatch`.

1. `yarn build` with production env vars set directly on the build step (CRA's `.env.local`
   would otherwise bake in the local-dev backend URL, see the workflow's inline comment)
2. `aws s3 sync build/ s3://frontend-softogram-ap-south-2/ --delete`
3. `aws cloudfront create-invalidation --distribution-id E3GNM6E0RDAH0J --paths "/*"`

A failed build stops the job before anything syncs, so a broken build never reaches production.

AWS auth is via GitHub's OIDC provider assuming an IAM role scoped to exactly
`s3:PutObject`/`s3:DeleteObject`/`s3:ListBucket` on the frontend bucket and
`cloudfront:CreateInvalidation` on the one distribution, no long-lived AWS keys stored in
GitHub. The role trust policy only allows assumption from `Softogram/softogram` on `main`.

## Backend - `.github/workflows/deploy-backend.yml`

Triggers on push to `main` touching `backend/**`, or manually via `workflow_dispatch`. Deploys
to the existing `softogram-server` EC2 instance over SSH, no new AWS resources.

`backend/content/**` (the JSON seed files) is explicitly excluded from the trigger path.
Those files only auto-populate an empty database on first boot (see the docstring in
`backend/cms.py`); once Postgres has real content, they are never read again, so changing
them has zero effect on the running service and does not warrant restarting production.
Real content edits happen through the admin panel, not a deploy.

1. SSH in with a dedicated CI-only deploy key (distinct from the interactive admin key)
2. `git fetch && git reset --hard origin/main`
3. `pip install -r requirements.txt`, `alembic upgrade head`
4. `sudo systemctl restart softogram-backend.service`
5. Health check: `curl http://127.0.0.1:8001/api/`

If the health check fails, the workflow automatically rolls back: `git reset --hard` to the
commit that was running before the deploy, reinstalls deps, restarts, and re-checks, then
still fails the job loudly so a bad deploy is visible, even though production is no longer down
on the broken commit.

## Required GitHub secrets

| Secret | Used by | What it is |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | frontend | IAM role ARN assumed via OIDC (not a credential itself) |
| `REACT_APP_POSTHOG_KEY` | frontend | PostHog project key baked into the build |
| `REACT_APP_POSTHOG_HOST` | frontend | PostHog ingest host baked into the build |
| `BACKEND_DEPLOY_SSH_KEY` | backend | Private half of the CI-only deploy keypair |

None of these are ops-checklist items for a human to rotate casually. If the SSH deploy key or
AWS role needs rotating, generate a new keypair/role and update the corresponding GitHub secret;
never reuse `softogram-key-pair.pem` (interactive admin access) for CI.
