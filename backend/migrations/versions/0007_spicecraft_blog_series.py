"""add the five-part SpiceCraft blog series, published

Posts spicecraft-01 to spicecraft-05, from the frozen pack file
content/blog_packs/2026-10-21-spicecraft-series.json (never edit that file;
edit the live posts through /admin instead). Same pattern as 0004 and 0006:
only an existing database is touched, because a brand-new one is still empty
here and cms.ensure_seeded() loads every pack file afterwards. A slug that
already exists is left alone, so re-running is harmless.

Downgrade removes the five posts and any comments on them.

Revision ID: f41cc6fda2b0
Revises: 82be9155afda
Create Date: 2026-10-21

"""
import json
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f41cc6fda2b0"
down_revision: Union[str, Sequence[str], None] = "82be9155afda"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PACK = Path(__file__).resolve().parents[2] / "content" / "blog_packs" / "2026-10-21-spicecraft-series.json"

blog_posts = sa.table(
    "blog_posts",
    sa.column("id", sa.String),
    sa.column("title", sa.String),
    sa.column("slug", sa.String),
    sa.column("excerpt", sa.String),
    sa.column("content", sa.Text),
    sa.column("author", sa.String),
    sa.column("date", sa.String),
    sa.column("tags", sa.JSON),
    sa.column("cover_image", sa.String),
    sa.column("cover_alt", sa.String),
    sa.column("cover_layout", sa.String),
    sa.column("share_image", sa.String),
    sa.column("published", sa.Boolean),
    sa.column("read_time", sa.Integer),
    sa.column("view_count", sa.Integer),
)


def _pack() -> list[dict]:
    return json.loads(PACK.read_text(encoding="utf-8"))


def upgrade() -> None:
    conn = op.get_bind()
    if conn.execute(sa.text("SELECT 1 FROM blog_posts LIMIT 1")).first() is None:
        return  # brand-new database: ensure_seeded() loads the pack instead
    existing = {row[0] for row in conn.execute(sa.text("SELECT slug FROM blog_posts"))}
    rows = [
        {
            "id": p["id"],
            "title": p["title"],
            "slug": p["slug"],
            "excerpt": p["excerpt"],
            "content": p["content"],
            "author": p["author"],
            "date": p["date"],
            "tags": p["tags"],
            "cover_image": p["coverImage"],
            "cover_alt": p["coverAlt"],
            "cover_layout": p["coverLayout"],
            "share_image": p["shareImage"],
            "published": p["published"],
            "read_time": p["readTime"],
            "view_count": 0,
        }
        for p in _pack()
        if p["slug"] not in existing
    ]
    if rows:
        op.bulk_insert(blog_posts, rows)


def downgrade() -> None:
    ids = [p["id"] for p in _pack()]
    op.get_bind().execute(sa.text("DELETE FROM blog_comments WHERE post_id = ANY(:ids)"), {"ids": ids})
    op.get_bind().execute(sa.text("DELETE FROM blog_posts WHERE id = ANY(:ids)"), {"ids": ids})
