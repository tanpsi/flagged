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

class UserPubForList(BaseModel):
    id: int
    name: str
    team_id: int | None
    team_name: str | None
    points: int

class ChallForUserPub(BaseModel):
    id: int
    name: str
    points: int

# Ouput user model - visible to public
class UserPub(UserPubForList):
    solves: list[ChallForUserPub]

class UserPubList(BaseModel):
    users: list[UserPubForList]

# Output user model - visible to user only
class User(UserPub):
    email: str
    admin: bool




class UserRegResp(BaseModel):
    message: Literal["User registered"]


class ChangePassResp(BaseModel):
    message: Literal["Password changed"]
