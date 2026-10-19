"""publish Ryup blog posts 6 and 7

Migration 0004 added both posts as unpublished drafts. The founder read them in
the admin preview and asked for them to go public, so this flips published to
true for those two slugs only. Nothing else about the posts changes.

The pack file content/blog_packs/2026-10-19-ryup-series-part-2.json now also
says published: true, so a brand-new database (seeded from the pack after
migrations run) ends in the same state as production.

Downgrade puts both back to draft.

Revision ID: c13499759024
Revises: 6434ecfef4c1
Create Date: 2026-10-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c13499759024"
down_revision: Union[str, Sequence[str], None] = "6434ecfef4c1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SLUGS = [
    "how-ryup-scores-your-morning-scoring-engine",
    "how-ryup-recommends-your-morning-content",
]


def upgrade() -> None:
    op.get_bind().execute(
        sa.text("UPDATE blog_posts SET published = true WHERE slug = ANY(:slugs)"), {"slugs": SLUGS}
    )


def downgrade() -> None:
    op.get_bind().execute(
        sa.text("UPDATE blog_posts SET published = false WHERE slug = ANY(:slugs)"), {"slugs": SLUGS}
    )
