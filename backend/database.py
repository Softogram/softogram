"""
Async SQLAlchemy engine + session (issue #31).
Postgres is the primary store; see docs/growth/phase-10-platform-plan-2026-08.md.
"""
import os

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# This default IS production's configuration: the EC2 host does not set
# DATABASE_URL, so whatever is written here is what the live API connects to.
# Changing it to a local-development port took production down until the
# deploy's health check rolled back. Local machines with a port conflict set
# DATABASE_URL in backend/.env and POSTGRES_HOST_PORT for compose instead -
# never by editing this line.
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://softogram:softogram@localhost:5432/softogram"
)

engine: AsyncEngine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
