from typing import Literal

from pydantic import BaseModel


class TokenResp(BaseModel):
    access_token: str
    token_type: str


class ExpireResp(BaseModel):
    message: Literal["Token expired"]
