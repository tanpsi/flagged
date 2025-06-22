import logging

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.config import DB_HOST, DB_PORT, DB_USER, DB_PASSWD, DB_NAME
from app.db.models import Base


DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"


engine = create_async_engine(
    DATABASE_URL, echo=True, echo_pool=True, pool_size=10, max_overflow=20
)

# session generator
# NOTE: With expire_on_commit=False, objects may become stale
# Don't depend on stale data while updating anything in DB
session_genr = async_sessionmaker(bind=engine, expire_on_commit=False)


async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # TODO: remove after everything is working
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
