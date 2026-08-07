"""
CMS content persistence - Postgres (issue #17; migrated off flat JSON files in Phase 10).
Seed JSON files under content/ still ship in-repo, but only to auto-seed a truly empty
database (local dev, CI, first prod boot) - see ensure_seeded(). Once anyone publishes or
edits via /admin, Postgres holds the real content and the seed files are never read again.

Admin auth (admin_password_ok / create_session / session_ok) is untouched here - that
still runs on the env-password + in-memory session mechanism. Moving it onto admin_users /
admin_sessions is Phase 11, not this one.
"""
from __future__ import annotations

import json
import os
import secrets
import time
from pathlib import Path
from typing import Any, Optional

from sqlalchemy import delete, select

from database import AsyncSessionLocal
from models import BlogPost, Project

ROOT = Path(__file__).parent
SEED_BLOGS = ROOT / "content" / "seed_blogs.json"
SEED_PROJECTS = ROOT / "content" / "seed_projects.json"

_sessions: dict[str, float] = {}  # token -> expiry epoch
SESSION_TTL_SEC = 60 * 60 * 12


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
    file-overwrite semantics, so the frontend needed no changes for this cutover)."""
    async with AsyncSessionLocal() as session:
        await session.execute(delete(BlogPost))
        for item in items:
            session.add(_blog_row(item))
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


async def blog_by_slug(slug: str) -> Optional[dict[str, Any]]:
    for b in await published_blogs():
        if b.get("slug") == slug:
            return b
    return None


def admin_password_ok(password: str) -> bool:
    expected = os.getenv("ADMIN_PASSWORD") or ""
    if not expected:
        return False
    return secrets.compare_digest(password or "", expected)


def create_session() -> str:
    token = secrets.token_urlsafe(32)
    _sessions[token] = time.time() + SESSION_TTL_SEC
    # prune
    now = time.time()
    expired = [k for k, exp in _sessions.items() if exp < now]
    for k in expired:
        _sessions.pop(k, None)
    return token


def session_ok(token: Optional[str]) -> bool:
    if not token:
        return False
    exp = _sessions.get(token)
    if not exp:
        return False
    if exp < time.time():
        _sessions.pop(token, None)
        return False
    return True
