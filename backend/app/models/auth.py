from typing import Annotated, Literal

from pydantic import BaseModel, StringConstraints, EmailStr

from app.config import EMAIL_ADDR_MAX_LEN, USERNAME_MAX_LEN, PASSWORD_MAX_LEN


# Input user model for registration
class UserReg(BaseModel):
    username: Annotated[
        str, StringConstraints(min_length=1, max_length=USERNAME_MAX_LEN)
    ]
    password: Annotated[
        str, StringConstraints(min_length=1, max_length=PASSWORD_MAX_LEN)
    ]
    email: Annotated[
        EmailStr, StringConstraints(min_length=1, max_length=EMAIL_ADDR_MAX_LEN)
    ]


# Ouput user model - visible to public
class UserPub(BaseModel):
    username: str


# Output user model - visible to user only
class User(BaseModel):
    username: str
    email: str


class TokenResp(BaseModel):
    access_token: str
    token_type: str


class UserRegResp(BaseModel):
    message: Literal["User registered"]


class ExpireResp(BaseModel):
    message: Literal["Token expired"]
