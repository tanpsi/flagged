from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI

from app.routers import service, auth, user, team, chall


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app import db, chall, user

    logging.basicConfig()
    await chall.init()
    await db.init()
    await user.create_admin()
    yield
    await db.engine.dispose()  # not required
    await chall.cleanup()


app = FastAPI(lifespan=lifespan)
app.include_router(service.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(team.router)
app.include_router(chall.router)
