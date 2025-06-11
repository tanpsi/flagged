from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import bearer
from app.models.auth import UserReg, TokenResp, UserRegResp, ExpireResp
from app.auth import add_user, check_user_passwd, gen_token, verify_token, expire_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_passwd(
    user: UserReg,
) -> UserRegResp:
    if await add_user(user):
        return UserRegResp(message="User registered")
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Username or email already in use",
    )


@router.post("/token")
async def login_passwd(
    form: Annotated[bearer.passwd_form, Depends()],
) -> TokenResp:
    if await check_user_passwd(form.username, form.password):
        return TokenResp(
            access_token=await gen_token(form.username), token_type="bearer"
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.delete("/expire")
async def logout(
    username: Annotated[str, Depends(verify_token)],
    token: Annotated[str, Depends(bearer.passwd)],
) -> ExpireResp:
    if await expire_token(token):
        return ExpireResp(message="Token expired")
    # Very low possiblity of the below case
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Token already expired",
    )
