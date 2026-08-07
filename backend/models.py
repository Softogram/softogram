"""
SQLAlchemy ORM models for all seven Postgres tables (issue #32).
Schema matches docs/growth/phase-10-platform-plan-2026-08.md.

admin_users / admin_sessions are created here but not wired into auth yet -
that cutover is Phase 11. Admin auth still runs on cms.py's env-password +
in-memory session mechanism until then.
"""
from datetime import datetime, timezone

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
