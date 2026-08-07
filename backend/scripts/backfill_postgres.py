"""
One-time backfill: existing JSONL/JSON data -> Postgres (issue #33).

Run once per environment, right before cutting that environment's traffic
over to this branch. Safe to re-run - every write is an upsert keyed on the
row's existing id, so running it twice just converges to the files' current
contents instead of duplicating rows.

Distinct from cms.ensure_seeded(), which only fires on a completely empty
table and seeds from the repo's static content/seed_*.json files. This
script instead migrates whatever real, possibly-edited data already exists
on disk: backend/data/contact_leads.jsonl, backend/data/cms_blogs.json,
backend/data/cms_projects.json.

Usage:
    cd backend && .venv/bin/python scripts/backfill_postgres.py
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy.dialects.postgresql import insert as pg_insert  # noqa: E402

from database import AsyncSessionLocal  # noqa: E402
from models import BlogPost, Lead, Project  # noqa: E402

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("LEADS_DATA_DIR", str(ROOT_DIR / "data")))
LEADS_JSONL = DATA_DIR / "contact_leads.jsonl"
CMS_BLOGS_JSON = DATA_DIR / "cms_blogs.json"
CMS_PROJECTS_JSON = DATA_DIR / "cms_projects.json"


def _read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def _read_json(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
        return data if isinstance(data, list) else []


async def _upsert_leads(rows: list[dict]) -> int:
    if not rows:
        return 0
    async with AsyncSessionLocal() as session:
        for row in rows:
            created_at = datetime.fromisoformat(row.get("timestamp") or row.get("created_at"))
            stmt = pg_insert(Lead).values(
                id=row["id"],
                name=row["name"],
                email=row["email"],
                phone=row["phone"],
                service=row["service"],
                message=row["message"],
                status=row.get("status", "new"),
                storage="postgres",
                created_at=created_at,
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=[Lead.id],
                set_={
                    "name": stmt.excluded.name,
                    "email": stmt.excluded.email,
                    "phone": stmt.excluded.phone,
                    "service": stmt.excluded.service,
                    "message": stmt.excluded.message,
                    "status": stmt.excluded.status,
                },
            )
            await session.execute(stmt)
        await session.commit()
    return len(rows)


async def _upsert_blogs(rows: list[dict]) -> int:
    if not rows:
        return 0
    async with AsyncSessionLocal() as session:
        for row in rows:
            stmt = pg_insert(BlogPost).values(
                id=row["id"],
                title=row.get("title", ""),
                slug=row["slug"],
                excerpt=row.get("excerpt", ""),
                content=row.get("content", ""),
                author=row.get("author", "Softogram Team"),
                date=row.get("date", ""),
                tags=row.get("tags", []),
                cover_image=row.get("coverImage", ""),
                published=row.get("published", True),
                read_time=row.get("readTime", 5),
            )
            update_cols = {c.name: getattr(stmt.excluded, c.name) for c in BlogPost.__table__.columns if c.name != "id"}
            stmt = stmt.on_conflict_do_update(index_elements=[BlogPost.id], set_=update_cols)
            await session.execute(stmt)
        await session.commit()
    return len(rows)


async def _upsert_projects(rows: list[dict]) -> int:
    if not rows:
        return 0
    async with AsyncSessionLocal() as session:
        for row in rows:
            stmt = pg_insert(Project).values(
                id=row["id"],
                client=row.get("client", ""),
                title=row.get("title", ""),
                desc=row.get("desc", ""),
                industry=row.get("industry", "Other"),
                services=row.get("services", []),
                outcome=row.get("outcome", ""),
                metrics=row.get("metrics", []),
                img=row.get("img", ""),
                year=row.get("year", ""),
                published=row.get("published", True),
                url=row.get("url", ""),
            )
            update_cols = {c.name: getattr(stmt.excluded, c.name) for c in Project.__table__.columns if c.name != "id"}
            stmt = stmt.on_conflict_do_update(index_elements=[Project.id], set_=update_cols)
            await session.execute(stmt)
        await session.commit()
    return len(rows)


async def main() -> None:
    leads = _read_jsonl(LEADS_JSONL)
    blogs = _read_json(CMS_BLOGS_JSON)
    projects = _read_json(CMS_PROJECTS_JSON)

    leads_n = await _upsert_leads(leads)
    blogs_n = await _upsert_blogs(blogs)
    projects_n = await _upsert_projects(projects)

    print(f"leads:    {leads_n} row(s) from {LEADS_JSONL}")
    print(f"blogs:    {blogs_n} row(s) from {CMS_BLOGS_JSON}")
    print(f"projects: {projects_n} row(s) from {CMS_PROJECTS_JSON}")
    print("Done. Safe to re-run - this always upserts by id.")


if __name__ == "__main__":
    asyncio.run(main())
