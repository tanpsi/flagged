from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

# MariaDB connection URL using async driver
DATABASE_URL = "mysql+aiomysql://username:password@localhost:3306/your_database"

# Async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,        # Number of connections to keep in the pool
    max_overflow=20,     # Additional connections allowed beyond the pool_size
    future=True,
)

# Async session maker
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for ORM models
Base = declarative_base()
