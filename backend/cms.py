"""
CMS content persistence - Postgres (issue #17; migrated off flat JSON files in Phase 10).
Seed JSON files under content/ still ship in-repo, but only to auto-seed a truly empty
database (local dev, CI, first prod boot) - see ensure_seeded(). Once anyone publishes or
edits via /admin, Postgres holds the real content and the seed files are never read again.

Admin auth (Phase 11 / issues #35-#37): argon2-hashed passwords in admin_users,
Postgres-backed sessions in admin_sessions. The shared ADMIN_PASSWORD env var is gone.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

from passlib.context import CryptContext
from sqlalchemy import delete, select

from database import AsyncSessionLocal
from models import AdminSession, AdminUser, BlogComment, BlogPost, Project

ROOT = Path(__file__).parent
SEED_BLOGS = ROOT / "content" / "seed_blogs.json"
SEED_PROJECTS = ROOT / "content" / "seed_projects.json"

SESSION_TTL_SEC = 60 * 60 * 12
_pwd = CryptContext(schemes=["argon2"], deprecated="auto")
_log = logging.getLogger("softogram")

# Verified against on every failed login where no matching user exists, so an
# unknown email takes the same time as a known email with the wrong password.
# Without this, response timing leaks which emails have admin accounts (an
# argon2 verify is deliberately slow; skipping it for unknown emails is fast
# enough to distinguish via simple timing - confirmed empirically: ~10ms vs
# ~30ms in local testing before this fix).
_DUMMY_HASH = _pwd.hash(secrets.token_urlsafe(32))


def _load_seed(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
        return data if isinstance(data, list) else []


def _blog_to_dict(row: BlogPost) -> dict[str, Any]:
    return {
        "id": row.id,
        "title": row.title,
        "slug": row.slug,
        "excerpt": row.excerpt,
        "content": row.content,
        "author": row.author,
        "date": row.date,
        "tags": row.tags or [],
        "coverImage": row.cover_image,
        "published": row.published,
        "readTime": row.read_time,
        "viewCount": row.view_count,
    }


def _project_to_dict(row: Project) -> dict[str, Any]:
    return {
        "id": row.id,
        "client": row.client,
        "title": row.title,
        "desc": row.desc,
        "industry": row.industry,
        "services": row.services or [],
        "outcome": row.outcome,
        "metrics": row.metrics or [],
        "img": row.img,
        "year": row.year,
        "published": row.published,
        "url": row.url,
    }


def _blog_row(item: dict[str, Any]) -> BlogPost:
    return BlogPost(
        id=item["id"],
        title=item.get("title", ""),
        slug=item["slug"],
        excerpt=item.get("excerpt", ""),
        content=item.get("content", ""),
        author=item.get("author", "Softogram Team"),
        date=item.get("date", ""),
        tags=item.get("tags", []),
        cover_image=item.get("coverImage", ""),
        published=item.get("published", True),
        read_time=item.get("readTime", 5),
    )


def _project_row(item: dict[str, Any]) -> Project:
    return Project(
        id=item["id"],
        client=item.get("client", ""),
        title=item.get("title", ""),
        desc=item.get("desc", ""),
        industry=item.get("industry", "Other"),
        services=item.get("services", []),
        outcome=item.get("outcome", ""),
        metrics=item.get("metrics", []),
        img=item.get("img", ""),
        year=item.get("year", ""),
        published=item.get("published", True),
        url=item.get("url", ""),
    )


async def ensure_seeded() -> None:
    """Fill blog_posts/projects from the repo's seed JSON files if a table is empty.
    Called once at app startup; no-op once real content exists."""
    async with AsyncSessionLocal() as session:
        has_blogs = (await session.execute(select(BlogPost.id).limit(1))).first()
        if has_blogs is None:
            for item in _load_seed(SEED_BLOGS):
                session.add(_blog_row(item))

        has_projects = (await session.execute(select(Project.id).limit(1))).first()
        if has_projects is None:
            for item in _load_seed(SEED_PROJECTS):
                session.add(_project_row(item))

        await session.commit()


async def get_blogs() -> list[dict[str, Any]]:
    async with AsyncSessionLocal() as session:
        rows = (await session.execute(select(BlogPost))).scalars().all()
        return [_blog_to_dict(r) for r in rows]


async def get_projects() -> list[dict[str, Any]]:
    async with AsyncSessionLocal() as session:
        rows = (await session.execute(select(Project))).scalars().all()
        return [_project_to_dict(r) for r in rows]


async def save_blogs(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Replace-all: the admin UI always PUTs its full working set (matches the old
    file-overwrite semantics, so the frontend needed no changes for this cutover).

    view_count is server-managed (incremented on each public read, see blog_by_slug)
    and never round-trips through the admin form - carry existing counts forward
    across the delete+recreate so editing a post doesn't silently zero its views."""
    async with AsyncSessionLocal() as session:
        existing_counts = dict((await session.execute(select(BlogPost.id, BlogPost.view_count))).all())
        # Bulk delete bypasses ORM relationship cascades — clear comments first (issue #42).
        await session.execute(delete(BlogComment))
        await session.execute(delete(BlogPost))
        for item in items:
            row = _blog_row(item)
            row.view_count = existing_counts.get(row.id, 0)
            session.add(row)
        await session.commit()
    return await get_blogs()


async def save_projects(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    async with AsyncSessionLocal() as session:
        await session.execute(delete(Project))
        for item in items:
            session.add(_project_row(item))
        await session.commit()
    return await get_projects()


async def published_blogs() -> list[dict[str, Any]]:
    return [b for b in await get_blogs() if b.get("published")]


async def published_projects() -> list[dict[str, Any]]:
    return [p for p in await get_projects() if p.get("published")]


async def get_published_blog_by_slug(slug: str) -> Optional[dict[str, Any]]:
    """Fetch a published post by slug without incrementing view_count (OG/RSS/comments)."""
    async with AsyncSessionLocal() as session:
        row = (
            await session.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.published.is_(True)))
        ).scalar_one_or_none()
        if row is None:
            return None
        return _blog_to_dict(row)


async def blog_by_slug(slug: str) -> Optional[dict[str, Any]]:
    """Fetch a published post by slug, counting the read as a view (issue #40)."""
    async with AsyncSessionLocal() as session:
        row = (
            await session.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.published.is_(True)))
        ).scalar_one_or_none()
        if row is None:
            return None
        row.view_count = (row.view_count or 0) + 1
        await session.commit()
        return _blog_to_dict(row)


def _comment_to_dict(row: BlogComment, *, include_post: bool = False) -> dict[str, Any]:
    out: dict[str, Any] = {
        "id": row.id,
        "postId": row.post_id,
        "name": row.name,
        "comment": row.comment,
        "approved": row.approved,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }
    if include_post and row.post is not None:
        out["postTitle"] = row.post.title
        out["postSlug"] = row.post.slug
    return out


async def list_approved_comments(slug: str) -> Optional[list[dict[str, Any]]]:
    """Public list for a post. Returns None if the slug is unknown / unpublished."""
    async with AsyncSessionLocal() as session:
        post = (
            await session.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.published.is_(True)))
        ).scalar_one_or_none()
        if post is None:
            return None
        rows = (
            await session.execute(
                select(BlogComment)
                .where(BlogComment.post_id == post.id, BlogComment.approved.is_(True))
                .order_by(BlogComment.created_at.asc())
            )
        ).scalars().all()
        return [_comment_to_dict(r) for r in rows]


async def create_comment(slug: str, name: str, comment: str) -> Optional[dict[str, Any]]:
    """Create an unapproved comment. Returns None if the slug is unknown / unpublished."""
    async with AsyncSessionLocal() as session:
        post = (
            await session.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.published.is_(True)))
        ).scalar_one_or_none()
        if post is None:
            return None
        row = BlogComment(post_id=post.id, name=name, comment=comment, approved=False)
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return _comment_to_dict(row)


async def list_pending_comments() -> list[dict[str, Any]]:
    async with AsyncSessionLocal() as session:
        rows = (
            await session.execute(
                select(BlogComment)
                .where(BlogComment.approved.is_(False))
                .order_by(BlogComment.created_at.asc())
            )
        ).scalars().all()
        post_ids = {r.post_id for r in rows}
        posts: dict[str, BlogPost] = {}
        if post_ids:
            for p in (
                await session.execute(select(BlogPost).where(BlogPost.id.in_(post_ids)))
            ).scalars().all():
                posts[p.id] = p
        out = []
        for r in rows:
            item = _comment_to_dict(r)
            post = posts.get(r.post_id)
            if post is not None:
                item["postTitle"] = post.title
                item["postSlug"] = post.slug
            out.append(item)
        return out


async def moderate_comment(comment_id: int, approved: bool) -> Optional[dict[str, Any]]:
    """Approve (approved=True) or reject/delete (approved=False). None if missing."""
    async with AsyncSessionLocal() as session:
        row = await session.get(BlogComment, comment_id)
        if row is None:
            return None
        if approved:
            row.approved = True
            await session.commit()
            await session.refresh(row)
            return _comment_to_dict(row)
        await session.delete(row)
        await session.commit()
        return {"id": comment_id, "deleted": True}


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def upsert_admin_user(email: str, password: str) -> AdminUser:
    """Create or update an admin by email (seed script + e2e boot). Never logs the password."""
    normalized = (email or "").strip().lower()
    if not normalized or not password:
        raise ValueError("email and password are required")
    pw_hash = hash_password(password)
    async with AsyncSessionLocal() as session:
        user = (
            await session.execute(select(AdminUser).where(AdminUser.email == normalized))
        ).scalar_one_or_none()
        if user is None:
            user = AdminUser(email=normalized, password_hash=pw_hash)
            session.add(user)
        else:
            user.password_hash = pw_hash
        await session.commit()
        await session.refresh(user)
        return user


async def ensure_admin_seeded() -> None:
    """Optional boot seed when ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD are set (CI/e2e)."""
    email = (os.getenv("ADMIN_SEED_EMAIL") or "").strip()
    password = os.getenv("ADMIN_SEED_PASSWORD") or ""
    if not email or not password:
        return
    await upsert_admin_user(email, password)
    _log.info("Admin seed ensured for %s", email.strip().lower())


async def authenticate_admin(email: str, password: str) -> Optional[int]:
    """Return admin_users.id on success, else None. Does not log credentials.
    Constant-time with respect to whether the email exists (see _DUMMY_HASH)."""
    normalized = (email or "").strip().lower()
    if not normalized or not password:
        _pwd.verify(password or "", _DUMMY_HASH)
        return None
    async with AsyncSessionLocal() as session:
        user = (
            await session.execute(select(AdminUser).where(AdminUser.email == normalized))
        ).scalar_one_or_none()
        if user is None:
            _pwd.verify(password, _DUMMY_HASH)
            return None
        try:
            ok = _pwd.verify(password, user.password_hash)
        except Exception:
            return None
        return user.id if ok else None


async def create_session(admin_user_id: int) -> str:
    """Issue a bearer token; store only sha256(token) in admin_sessions."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=SESSION_TTL_SEC)
    async with AsyncSessionLocal() as session:
        session.add(
            AdminSession(
                token_hash=_hash_token(token),
                admin_user_id=admin_user_id,
                expires_at=expires_at,
            )
        )
        await session.commit()
    return token


async def session_ok(token: Optional[str]) -> bool:
    """Validate a bearer token against Postgres; lazy-delete expired rows."""
    if not token:
        return False
    th = _hash_token(token)
    async with AsyncSessionLocal() as session:
        row = (
            await session.execute(select(AdminSession).where(AdminSession.token_hash == th))
        ).scalar_one_or_none()
        if row is None:
            return False
        now = datetime.now(timezone.utc)
        exp = row.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            await session.delete(row)
            await session.commit()
            return False
        return True
