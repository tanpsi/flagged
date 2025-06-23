from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.models.user import UserReg, UserRegResp, UserUpdate, User, UserPub, UserPubList
from app.db.models import User as UserDB
from app.auth import verify_token
from app.user import create_user, get_user_pub, get_user_pub_list, get_user, update_user

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_user(
    user: UserReg,
) -> UserRegResp:
    if await create_user(user):
        return UserRegResp(message="User registered")
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Username or email already in use",
    )


@router.put("/update")
async def change_user_details(
    user: Annotated[UserDB, Depends(verify_token)], new_details: UserUpdate
):
    try:
        if await update_user(user.id, new_details):
            return {"message": "User updated"}
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already in use",
            )
    except NoResultFound:
        raise RuntimeError("Logged user's id not corresponding to a user")


@router.get("/")
async def get_logged_user_details(
    user: Annotated[UserDB, Depends(verify_token)],
) -> User:
    return await get_user(user.id)


@router.get("s/<user_id>")
async def get_other_user_details(user_id: int) -> UserPub:
    try:
        return await get_user_pub(user_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user associated with the id",
        )


@router.get("s")
async def get_user_list() -> UserPubList:
    return await get_user_pub_list()
