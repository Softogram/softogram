"""Upsolve by Softogram: demo bookings, enrolments and payment events

Three tables behind the /upsolve page (issues #152 and #154):

- upsolve_demo_bookings: the "Book a free demo seat" form.
- upsolve_enrolments: one row per Razorpay order for a batch seat, with its
  outcome. A paid row with instalment_no 1 is one seat taken, which is what the
  public counters on the page count.
- upsolve_payment_events: every Razorpay webhook delivery by event id, so a
  redelivered event is applied once.

Revision ID: 9c4e2b7d1f03
Revises: f41cc6fda2b0
Create Date: 2026-11-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c4e2b7d1f03"
down_revision: Union[str, Sequence[str], None] = "f41cc6fda2b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "upsolve_demo_bookings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=15), nullable=False),
        sa.Column("college", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("year", sa.String(length=40), nullable=False, server_default=""),
        sa.Column("demo_date", sa.String(length=10), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="new"),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_upsolve_demo_bookings_phone", "upsolve_demo_bookings", ["phone"])
    op.create_index("ix_upsolve_demo_bookings_demo_date", "upsolve_demo_bookings", ["demo_date"])
    op.create_index("ix_upsolve_demo_bookings_created_at", "upsolve_demo_bookings", ["created_at"])

    op.create_table(
        "upsolve_enrolments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=15), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("college", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("language", sa.String(length=20), nullable=False, server_default="C++"),
        sa.Column("plan", sa.String(length=20), nullable=False, server_default="full"),
        sa.Column("early_bird", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("instalment_no", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("amount_paise", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("razorpay_order_id", sa.String(length=64), nullable=True),
        sa.Column("razorpay_payment_id", sa.String(length=64), nullable=True),
        sa.Column("razorpay_link_id", sa.String(length=64), nullable=True),
        sa.Column("payment_link_url", sa.String(length=300), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("source", sa.String(length=20), nullable=False, server_default="site"),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("razorpay_order_id"),
        sa.UniqueConstraint("razorpay_payment_id"),
        sa.UniqueConstraint("razorpay_link_id"),
    )
    op.create_index("ix_upsolve_enrolments_phone", "upsolve_enrolments", ["phone"])
    op.create_index("ix_upsolve_enrolments_status", "upsolve_enrolments", ["status"])
    op.create_index("ix_upsolve_enrolments_created_at", "upsolve_enrolments", ["created_at"])

    op.create_table(
        "upsolve_payment_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("event_id", sa.String(length=64), nullable=False),
        sa.Column("event", sa.String(length=60), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("event_id"),
    )


def downgrade() -> None:
    op.drop_table("upsolve_payment_events")
    op.drop_index("ix_upsolve_enrolments_created_at", table_name="upsolve_enrolments")
    op.drop_index("ix_upsolve_enrolments_status", table_name="upsolve_enrolments")
    op.drop_index("ix_upsolve_enrolments_phone", table_name="upsolve_enrolments")
    op.drop_table("upsolve_enrolments")
    op.drop_index("ix_upsolve_demo_bookings_created_at", table_name="upsolve_demo_bookings")
    op.drop_index("ix_upsolve_demo_bookings_demo_date", table_name="upsolve_demo_bookings")
    op.drop_index("ix_upsolve_demo_bookings_phone", table_name="upsolve_demo_bookings")
    op.drop_table("upsolve_demo_bookings")
