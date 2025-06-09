from fastapi import FastAPI

from app.routers import service


app = FastAPI()
app.include_router(service.router)
