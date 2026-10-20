"""add Ryup blog post 8 (the retry ladder) and correct one paragraph of post 1

Post 8, "Why Ryup has no snooze button", goes in published, from the frozen pack
file content/blog_packs/2026-10-20-ryup-retry-ladder.json (never edit that file;
edit the live post through /admin instead). Same pattern as 0004: only an
existing database is touched, because a brand-new one is still empty here and
cms.ensure_seeded() loads every pack file afterwards. A slug that already exists
is left alone, so re-running is harmless.

Post 1 said the backend notices a missed alarm and reschedules it. That has not
been true since 2026-08-14: retries are booked by the phone's own alarm code, and
the backend only supplies the numbers. This replaces that one heading and
paragraph with the true version, which also links to post 8. It is a text
replacement rather than a whole-post rewrite, so an edit made since through
/admin elsewhere in the post survives, and a post already corrected by hand is
left alone. The pack file 2026-10-19-ryup-series.json carries the same
correction, so a brand-new database matches.

Not done through /admin, because an admin save currently replaces every post and
deletes all blog comments (cms.save_blogs).

Downgrade removes post 8 (and any comments on it) and puts the old paragraph back.

Revision ID: 82be9155afda
Revises: c13499759024
Create Date: 2026-10-20

"""
import json
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "82be9155afda"
down_revision: Union[str, Sequence[str], None] = "c13499759024"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PACK = Path(__file__).resolve().parents[2] / "content" / "blog_packs" / "2026-10-20-ryup-retry-ladder.json"

POST_1 = "reliable-alarm-ios-alarmkit-android-exact-alarms"
OLD_HEADING = "## The part the phone cannot do: knowing you woke up"
NEW_HEADING = "## Knowing whether you woke up"
OLD_PARAGRAPH = (
    "Neither system can tell us whether you actually got up. So the \"did they wake up?\" check lives on our "
    "backend. If an alarm rang and nobody started the activity in time, the backend notices, and the alarm is "
    "rescheduled to ring again. One shared mechanism covers both platforms, instead of two different ones that "
    "could disagree."
)
NEW_PARAGRAPH = (
    "Neither system can tell us whether you actually got up, so the phone checks for itself. If an alarm rang "
    "and nobody finished the activity in time, the phone's own alarm code books the next ring, on both "
    "platforms, without asking a server. Only the numbers (how long a ring lasts, how long to wait, how many "
    "tries) come from our backend, so we can tune them without an app update. We explain that retry ladder in "
    "detail in [why Ryup has no snooze button](/blog/why-ryup-has-no-snooze-backend-tuned-retry-ladder)."
)

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


def _replace_in_post_1(old: list[str], new: list[str]) -> None:
    conn = op.get_bind()
    content = conn.execute(sa.text("SELECT content FROM blog_posts WHERE slug = :s"), {"s": POST_1}).scalar()
    if content is None:
        return
    updated = content
    for before, after in zip(old, new):
        updated = updated.replace(before, after)
    if updated != content:
        conn.execute(sa.text("UPDATE blog_posts SET content = :c WHERE slug = :s"), {"c": updated, "s": POST_1})


def upgrade() -> None:
    conn = op.get_bind()
    if conn.execute(sa.text("SELECT 1 FROM blog_posts LIMIT 1")).first() is None:
        return  # brand-new database: ensure_seeded() loads the packs instead
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
    _replace_in_post_1([OLD_HEADING, OLD_PARAGRAPH], [NEW_HEADING, NEW_PARAGRAPH])


def downgrade() -> None:
    _replace_in_post_1([NEW_HEADING, NEW_PARAGRAPH], [OLD_HEADING, OLD_PARAGRAPH])
    ids = [p["id"] for p in _pack()]
    op.get_bind().execute(sa.text("DELETE FROM blog_comments WHERE post_id = ANY(:ids)"), {"ids": ids})
    op.get_bind().execute(sa.text("DELETE FROM blog_posts WHERE id = ANY(:ids)"), {"ids": ids})
