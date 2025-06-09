from enum import StrEnum

from passlib.context import CryptContext

from app.config import PASSWD_HASH_SCHEME


class HashScheme(StrEnum):
    argon2 = "argon2"
    bcrypt = "bcrypt"


ctx = CryptContext(schemes=[HashScheme[PASSWD_HASH_SCHEME].value], truncate_error=True)


def hash(passwd: str | bytes) -> str:
    return ctx.hash(passwd)


def verify(passwd: str | bytes, hash: str) -> bool:
    return ctx.verify(passwd, hash)
