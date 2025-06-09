import secrets
from enum import StrEnum
from typing import Literal

import jwt
from jwt.exceptions import DecodeError, InvalidSignatureError

from app.config import JWT_ALG, JWT_HS256_SECRET

if not JWT_HS256_SECRET:
    JWT_HS256_SECRET = secrets.token_bytes(32)
else:
    JWT_HS256_SECRET = JWT_HS256_SECRET.encode("utf-8")


class Alg(StrEnum):
    HS256 = "HS256"
    HS512 = "HS512"
    ES256 = "ES256"
    ES512 = "ES512"
    PS256 = "PS256"
    PS512 = "PS512"


def generate_token(
    data: dict, alg: Alg = Alg[JWT_ALG], secret: bytes = JWT_HS256_SECRET
) -> str:
    if alg != Alg.HS256:
        raise NotImplementedError("Only HS256 algorithm is implemeted yet")
    return jwt.encode(data, key=secret, algorithm=alg.value)


def verify_token(
    token: str, alg: Alg = Alg[JWT_ALG], secret: bytes = JWT_HS256_SECRET
) -> dict | Literal[False]:
    if alg != Alg.HS256:
        raise NotImplementedError("Only HS256 algorithm is implemeted yet")
    try:
        return jwt.decode(token, key=secret, algorithms=[alg.value])
    except (DecodeError, InvalidSignatureError):
        return False
