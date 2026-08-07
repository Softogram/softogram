"""
Create or update the first admin account (Phase 11 / issue #35).

Interactive:
    cd backend && .venv/bin/python scripts/seed_admin.py

Non-interactive (CI / automation):
    cd backend && .venv/bin/python scripts/seed_admin.py \\
        --email admin@example.com --password 'strong-password'

Never prints or logs the password.
"""
from __future__ import annotations

import argparse
import asyncio
import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from cms import upsert_admin_user  # noqa: E402


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Seed Softogram admin_users (argon2).")
    p.add_argument("--email", help="Admin email (prompted if omitted)")
    p.add_argument("--password", help="Admin password (prompted if omitted)")
    return p.parse_args()


async def _main() -> int:
    args = _parse_args()
    email = (args.email or "").strip() or input("Admin email: ").strip()
    if not email:
        print("email is required", file=sys.stderr)
        return 1
    password = args.password
    if not password:
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("passwords do not match", file=sys.stderr)
            return 1
    if len(password) < 8:
        print("password must be at least 8 characters", file=sys.stderr)
        return 1

    user = await upsert_admin_user(email, password)
    print(f"Admin ready: id={user.id} email={user.email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(_main()))
