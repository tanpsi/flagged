from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter

from app.routers import service, auth, user, team, chall, notification


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app import db, chall, user

    # --- New: Initialize Redis and FastAPILimiter ---
    logging.info("Connecting to Redis...")
    # Use a Redis connection pool. Replace with your Redis URL if it's different.
    redis_connection = redis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_connection)
    logging.info("Redis connection and FastAPILimiter initialized.")
    # ------------------------------------------------

    logging.basicConfig()
    await chall.init()
    await db.init()
    await user.create_admin()
    yield

    # --- New: Close FastAPILimiter connection (optional but good practice) ---
    await FastAPILimiter.close()
    logging.info("FastAPILimiter connection closed.")
    # -----------------------------------------------------------------------

    await db.engine.dispose()
    await chall.cleanup()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # only allow your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(service.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(team.router)
app.include_router(chall.router)
app.include_router(notification.router)
