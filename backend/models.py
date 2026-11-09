"""
SQLAlchemy ORM models for all seven Postgres tables (issue #32).
Schema matches docs/growth/phase-10-platform-plan-2026-08.md.

admin_users / admin_sessions are wired in Phase 11 (argon2 passwords +
Postgres-backed session tokens).
"""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(20))
    service: Mapped[str] = mapped_column(String(100))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="new")
    storage: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    admin_user_id: Mapped[int] = mapped_column(ForeignKey("admin_users.id"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    excerpt: Mapped[str] = mapped_column(String(1000), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    author: Mapped[str] = mapped_column(String(120), default="Softogram Team")
    date: Mapped[str] = mapped_column(String(40), default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    cover_image: Mapped[str] = mapped_column(String(500), default="")
    # Alt text for the cover. "banner" covers are decorative photos shown faded behind
    # the title; "diagram" covers are content, shown in full under the title.
    cover_alt: Mapped[str] = mapped_column(String(500), default="")
    cover_layout: Mapped[str] = mapped_column(String(20), default="banner")
    # Link-preview image (og:image). Social networks ignore SVG, so a diagram post
    # points this at a PNG copy; empty means "use cover_image".
    share_image: Mapped[str] = mapped_column(String(500), default="")
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    read_time: Mapped[int] = mapped_column(Integer, default=5)
    view_count: Mapped[int] = mapped_column(Integer, default=0)

    comments: Mapped[list["BlogComment"]] = relationship(back_populates="post", cascade="all, delete-orphan")


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_id: Mapped[str] = mapped_column(ForeignKey("blog_posts.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    comment: Mapped[str] = mapped_column(Text)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    post: Mapped["BlogPost"] = relationship(back_populates="comments")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    client: Mapped[str] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(String(200))
    desc: Mapped[str] = mapped_column(Text, default="")
    industry: Mapped[str] = mapped_column(String(80), default="Other")
    services: Mapped[list] = mapped_column(JSON, default=list)
    outcome: Mapped[str] = mapped_column(Text, default="")
    metrics: Mapped[list] = mapped_column(JSON, default=list)
    img: Mapped[str] = mapped_column(String(500), default="")
    year: Mapped[str] = mapped_column(String(10), default="")
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    url: Mapped[str] = mapped_column(String(500), default="")


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


# --- Upsolve by Softogram: live DSA coaching (issues #152, #154) ---


class UpsolveDemoBooking(Base):
    """A seat booked for a free demo class from the form on /upsolve.

    Status is set by the admin by hand: new, link_sent, attended, not_interested.
    """

    __tablename__ = "upsolve_demo_bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    # Ten digits, no country code, so one person books once per demo date.
    phone: Mapped[str] = mapped_column(String(15), index=True)
    college: Mapped[str] = mapped_column(String(120), default="")
    year: Mapped[str] = mapped_column(String(40), default="")
    demo_date: Mapped[str] = mapped_column(String(10), index=True)
    status: Mapped[str] = mapped_column(String(20), default="new")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)


class UpsolveEnrolment(Base):
    """One payment attempt for a batch seat: a Razorpay order and its outcome.

    A paid row with instalment_no 1 is one seat taken. A second instalment is
    its own row with instalment_no 2. Status: pending, paid, failed, refunded.
    Source: site (checkout on the page), link (a Razorpay payment link sent on
    WhatsApp), manual (a UPI transfer the admin recorded by hand).
    """

    __tablename__ = "upsolve_enrolments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(15), index=True)
    email: Mapped[str] = mapped_column(String(255), default="")
    college: Mapped[str] = mapped_column(String(120), default="")
    language: Mapped[str] = mapped_column(String(20), default="C++")
    plan: Mapped[str] = mapped_column(String(20), default="full")
    early_bird: Mapped[bool] = mapped_column(Boolean, default=False)
    instalment_no: Mapped[int] = mapped_column(Integer, default=1)
    amount_paise: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    razorpay_order_id: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    # Set only for a payment link sent on WhatsApp.
    razorpay_link_id: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    payment_link_url: Mapped[str] = mapped_column(String(300), default="")
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    source: Mapped[str] = mapped_column(String(20), default="site")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class UpsolvePaymentEvent(Base):
    """Every Razorpay webhook delivery, keyed by its event id so a redelivery is
    applied once. The payload is kept so an unmatched payment can be sorted out
    by hand later."""

    __tablename__ = "upsolve_payment_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(64), unique=True)
    event: Mapped[str] = mapped_column(String(60))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
