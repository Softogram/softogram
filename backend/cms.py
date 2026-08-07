"""
CMS seed + file persistence (issue #17).
Runtime writes go under DATA_DIR; seeds ship in-repo for first boot / fallback.
"""
from __future__ import annotations

import json
import os
import secrets
import threading
import time
from copy import deepcopy
from pathlib import Path
from typing import Any, Optional

ROOT = Path(__file__).parent
SEED_BLOGS = ROOT / "content" / "seed_blogs.json"
SEED_PROJECTS = ROOT / "content" / "seed_projects.json"

_lock = threading.Lock()
_sessions: dict[str, float] = {}  # token -> expiry epoch
SESSION_TTL_SEC = 60 * 60 * 12


def _data_dir() -> Path:
    return Path(os.getenv("LEADS_DATA_DIR", str(ROOT / "data")))


def _blogs_path() -> Path:
    return _data_dir() / "cms_blogs.json"


def _projects_path() -> Path:
    return _data_dir() / "cms_projects.json"


def _read_json(path: Path, fallback: list) -> list:
    if path.exists():
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else fallback
    return deepcopy(fallback)


def _write_json(path: Path, data: list) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
        f.flush()
        os.fsync(f.fileno())
    tmp.replace(path)


def _load_seed(path: Path) -> list:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
        return data if isinstance(data, list) else []


def get_blogs() -> list[dict[str, Any]]:
    with _lock:
        seed = _load_seed(SEED_BLOGS)
        return _read_json(_blogs_path(), seed)


def get_projects() -> list[dict[str, Any]]:
    with _lock:
        seed = _load_seed(SEED_PROJECTS)
        return _read_json(_projects_path(), seed)


def save_blogs(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    with _lock:
        _write_json(_blogs_path(), items)
        return items


def save_projects(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    with _lock:
        _write_json(_projects_path(), items)
        return items


def published_blogs() -> list[dict[str, Any]]:
    return [b for b in get_blogs() if b.get("published")]


def published_projects() -> list[dict[str, Any]]:
    return [p for p in get_projects() if p.get("published")]


def blog_by_slug(slug: str) -> Optional[dict[str, Any]]:
    for b in published_blogs():
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
