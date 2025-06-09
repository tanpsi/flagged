from fastapi import APIRouter

router = APIRouter(
    prefix="/service",
    tags=["service"],
)


@router.get("/hello")
async def hello():
    return {"message": "Hello world!"}
