"""add Ryup blog posts 6 and 7 as unpublished drafts

Both posts went in with published=false (hidden from /blog, the sitemap and RSS,
previewable at /blog/<slug> by a signed-in admin). Migration 0005 published them,
and the pack file now says published: true so fresh databases match.

Posts live in Postgres and are normally written through /admin, so a reviewed
pull request adds them with this data migration. It reads the frozen pack
file content/blog_packs/2026-10-19-ryup-series-part-2.json (never edit that file; edit
the live posts through /admin instead).

Only an existing database is touched. A brand-new one (local dev, e2e) is still
empty when migrations run, and cms.ensure_seeded() then loads the seed posts and
every pack file together, so both paths end with the same posts. A post whose
slug already exists is left alone, which makes re-running harmless.

Revision ID: 6434ecfef4c1
Revises: ea4a70b8e8ab
Create Date: 2026-10-19

"""
import json
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6434ecfef4c1"
down_revision: Union[str, Sequence[str], None] = "ea4a70b8e8ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PACK = Path(__file__).resolve().parents[2] / "content" / "blog_packs" / "2026-10-19-ryup-series-part-2.json"

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
