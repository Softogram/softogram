# Ops: contact lead persistence (issue #3, migrated to Postgres in Phase 10)

Every accepted `POST /api/contact` is written to the `leads` table in Postgres **before** the HTTP success response.
See `docs/growth/phase-10-platform-plan-2026-08.md` for the full schema and migration plan.

SendGrid runs in a background task with **3 attempts** and exponential backoff. Final failure:

- ERROR log: `ALERT contact_email_final_failure lead_id=…`
- Append: `backend/data/contact_email_failures.jsonl` (still file-based; only the failure log, not leads)

## Read leads on the server

```bash
# Latest leads
docker compose exec postgres psql -U softogram -d softogram \
  -c "SELECT id, name, email, service, status, created_at FROM leads ORDER BY created_at DESC LIMIT 20;"

# Email send failures ready to replay
tail -n 20 /path/to/backend/data/contact_email_failures.jsonl | jq .
```

## Env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (default: local docker-compose instance) |
| `LEADS_DATA_DIR` | Directory for the SendGrid failure log (default `backend/data`) |
| `SENDGRID_*` | Unchanged email config |

## Migrating an existing environment onto Postgres

If an environment still has real leads in `backend/data/contact_leads.jsonl` from before this change, run the one-time backfill once, right before cutting that environment's traffic over:

```bash
cd backend && .venv/bin/python scripts/backfill_postgres.py
```

Safe to re-run - every row is upserted by its existing id.
