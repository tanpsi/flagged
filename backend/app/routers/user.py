from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import StringConstraints

from app.db.models import User as UserDB
from app.models.user import UserReg, UserRegResp, ChangePassResp, User, UserPub, UserPubList
from app.auth import verify_token
from app.user import create_user, change_user_passwd, get_user_pub, get_user_pub_list, get_user
from app.config import USERNAME_MAX_LEN

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



@router.put("/change-password")
async def change_passwd(
    user: Annotated[UserDB, Depends(verify_token)],
    new_password: Annotated[
        str, StringConstraints(min_length=1, max_length=USERNAME_MAX_LEN)
    ],
) -> ChangePassResp:
    if await change_user_passwd(user.username, new_password):
        return ChangePassResp(message="Password changed")
    raise RuntimeError

@router.get("/")
async def get_logged_user_details(user: Annotated[UserDB, Depends(verify_token)]) -> User:
    return await get_user(user)


@router.get("s/<user_id>")
async def get_other_user_details(user_id: int) -> UserPub:
    try:
        return await get_user_pub(user_id=user_id)
    except ZeroDivisionError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user associated with the id")

@router.get("s")
async def get_user_list() -> UserPubList:
    return await get_user_pub_list()
