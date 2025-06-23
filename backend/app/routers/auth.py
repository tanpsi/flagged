from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import bearer_passwd, bearer_passwd_form
from app.db.models import User as UserDB
from app.models.auth import TokenResp, ExpireResp
from app.auth import verify_user_passwd, gen_token, verify_token, expire_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login")
async def login_user(
    form: Annotated[bearer_passwd_form, Depends()],
) -> TokenResp:
    if await verify_user_passwd(form.username, form.password):
        return TokenResp(
            access_token=await gen_token(form.username), token_type="bearer"
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.delete("/logout")
async def logout_user(
    user: Annotated[UserDB, Depends(verify_token)],
    token: Annotated[str, Depends(bearer_passwd)],
) -> ExpireResp:
    if await expire_token(token):
        return ExpireResp(message="Token expired")
    # Very low possiblity of the below case
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Token already expired",
    )
