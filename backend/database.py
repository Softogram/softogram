"""
Async SQLAlchemy engine + session (issue #31).
Postgres is the primary store; see docs/growth/phase-10-platform-plan-2026-08.md.
"""
import os

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# Port 5433 matches the host mapping in docker-compose.yml, which avoids the
# common conflict with another project's Postgres already on 5432. CI sets
# DATABASE_URL explicitly and is unaffected by this default.
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://softogram:softogram@localhost:5433/softogram"
)

engine: AsyncEngine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
