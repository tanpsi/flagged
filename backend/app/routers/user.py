from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import NoResultFound

from app.models.user import (
    UserReg,
    UserRegResp,
    UserUpdate,
    UserUpdateInternal,
    User,
    UserPub,
    UserPubList,
)
from app.db.models import User as UserDB
from app.auth import verify_token
from app.user import (
    create_user,
    get_user_pub,
    get_user_pub_list,
    get_user,
    update_user,
    verify_user_email_token,
)
from app.utils.email_utils import send_verification_email
from app.config import FRONTEND_BASE_URL, VERIFY_USER_EMAIL

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_user(user: UserReg, bg_tasks: BackgroundTasks) -> UserRegResp:
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
        if await update_user(user.id, UserUpdateInternal(**new_details.model_dump())):
            return {"message": "User updated"}
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already in use",
            )
    except NoResultFound:
        raise RuntimeError("Logged user's id not corresponding to a user")


@router.get("/email/verify")
async def verify_email_of_user(token: str):
    if not await verify_user_email_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email verify token invalid",
        )
    return RedirectResponse(FRONTEND_BASE_URL)


@router.get("/email/send")
async def send_email_for_user_email_verification(
    user: Annotated[UserDB, Depends(verify_token)], bg_tasks: BackgroundTasks
):
    if not VERIFY_USER_EMAIL:
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Email verification disabled"
        )
    bg_tasks.add_task(send_verification_email, user)
    return {"mesaage": "Email sent (probably)"}


@router.get("/")
async def get_logged_user_details(
    user: Annotated[UserDB, Depends(verify_token)],
) -> User:
    return await get_user(user.id)


@router.get("s/{user_id}")
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
