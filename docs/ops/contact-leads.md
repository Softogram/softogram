# Ops: contact lead persistence (issue #3)

Every accepted `POST /api/contact` is written **before** the HTTP success response:

1. **JSONL (always):** `backend/data/contact_leads.jsonl` (override dir with `LEADS_DATA_DIR`)
2. **Mongo (best effort):** `contact_submissions` collection, `serverSelectionTimeoutMS=2000`

SendGrid runs in a background task with **3 attempts** and exponential backoff. Final failure:

- ERROR log: `ALERT contact_email_final_failure lead_id=…`
- Append: `backend/data/contact_email_failures.jsonl`

## Read leads on the server

```bash
# Latest leads
tail -n 20 /path/to/backend/data/contact_leads.jsonl | jq .

# Email send failures ready to replay
tail -n 20 /path/to/backend/data/contact_email_failures.jsonl | jq .

# Mongo (if available)
mongosh "$MONGO_URL" --eval 'db.getSiblingDB("softogram_db").contact_submissions.find().sort({timestamp:-1}).limit(20)'
```

## Env

| Variable | Purpose |
|----------|---------|
| `LEADS_DATA_DIR` | Directory for JSONL files (default `backend/data`) |
| `MONGO_URL` / `DB_NAME` | Optional Mongo mirror |
| `SENDGRID_*` | Unchanged email config |

JSONL paths are gitignored — deploy hosts must ensure the data directory is writable and backed up.
