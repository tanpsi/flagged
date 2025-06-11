from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth import verify_token

router = APIRouter(
    prefix="/service",
    tags=["service"],
)


@router.get("/hello")
async def hello():
    return {"message": "Hello world!"}


@router.get("/hello_user")
async def hello_user(username: Annotated[str, Depends(verify_token)]):
    return {"message": f"Hello {username}"}
