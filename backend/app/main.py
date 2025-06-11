from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routers import service, auth
from app import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init()
    yield
    await db.engine.dispose()  # not required


app = FastAPI(lifespan=lifespan)
app.include_router(service.router)
app.include_router(auth.router)
