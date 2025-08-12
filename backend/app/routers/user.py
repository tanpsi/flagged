from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import NoResultFound
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import session_genr
from app.db.models import User as UserDB
from pydantic import BaseModel, EmailStr
from sqlalchemy.future import select
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with session_genr() as session:
        yield session

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
    delete_user,
    get_user_pub,
    get_user_pub_list,
    get_user,
    update_user,
    verify_user_email_token,
)
from app.utils.email_utils import send_verification_email
from app.config import FRONTEND_BASE_URL, VERIFY_USER_EMAIL
from app.utils.email_utils import send_forgot_password_email 
router = APIRouter(
    prefix="/user",
    tags=["user"],
)
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/email/forgot-password")
async def send_forgot_password(
    request: ForgotPasswordRequest,
    bg_tasks: BackgroundTasks,
    session=Depends(get_session)
):
    # Check if the email exists in the database
    result = await session.execute(
        select(UserDB).where(UserDB.email == request.email)
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with that email"
        )

    # Queue background task to send the email
    bg_tasks.add_task(send_forgot_password_email, user)

    return {"message": "Password reset email has been sent."}


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_user(user: UserReg, bg_tasks: BackgroundTasks) -> UserRegResp:
    if await create_user(user):
        return UserRegResp(message="User registered")
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Username or email already in use",
    )


@router.delete("/delete")
async def remove_user(user: Annotated[UserDB, Depends(verify_token)]):
    if await delete_user(user.id):
        return {"message": "User deleted"}
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="User in a team",
    )


@router.delete("/delete/{user_id}")
async def remove_other_user(
    user: Annotated[UserDB, Depends(verify_token)], user_id: int
):
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Only admin allowed"
        )
    if await delete_user(user_id):
        return {"message": "User deleted"}
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User not exist or user in a team",
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


@router.put("/update/{user_id}")
async def change_other_user_details(
    user: Annotated[UserDB, Depends(verify_token)],
    new_details: UserUpdateInternal,
    user_id: int,
):
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Only admin allowed"
        )
    try:
        if await update_user(user_id, new_details):
            return {"message": "User updated"}
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already in use or",
            )
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user_id not available"
        )


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
from pydantic import BaseModel, EmailStr

class ResetPasswordRequest(BaseModel):
    username: str
    email: EmailStr
    new_password: str

@router.put("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    async with session_genr() as session:
        result = await session.execute(
            select(UserDB).where(
                UserDB.username == request.username,
                UserDB.email == request.email,
            )
        )
        user = result.scalars().first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User with provided username and email not found",
            )

        details = UserUpdateInternal(
            username=None,
            email=None,
            password=request.new_password,
            admin=None,
            email_verified=None,
        )

        success = await update_user(user.id, details)
        if not success:
            raise HTTPException(
                status_code=400,
                detail="Failed to update password",
            )

    return {"message": "Password updated successfully"}
