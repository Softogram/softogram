"""blog posts: cover alt text, cover layout and share image

Diagram posts show their cover in full under the title instead of as a faded
banner, need real alt text, and need a PNG for link previews because social
networks ignore SVG. Existing posts keep the old behaviour via the defaults.

Revision ID: 5df0669aba8a
Revises: e76268a0d654
Create Date: 2026-10-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5df0669aba8a"
down_revision: Union[str, Sequence[str], None] = "e76268a0d654"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("blog_posts", sa.Column("cover_alt", sa.String(length=500), nullable=False, server_default=""))
    op.add_column(
        "blog_posts", sa.Column("cover_layout", sa.String(length=20), nullable=False, server_default="banner")
    )
    op.add_column("blog_posts", sa.Column("share_image", sa.String(length=500), nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("blog_posts", "share_image")
    op.drop_column("blog_posts", "cover_layout")
    op.drop_column("blog_posts", "cover_alt")
