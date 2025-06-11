from sqlalchemy import String, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.ext.asyncio import AsyncAttrs

from app.auth import hashing
from app.config import USERNAME_MAX_LEN, EMAIL_ADDR_MAX_LEN, TOKEN_MAX_LEN


class Base(AsyncAttrs, DeclarativeBase):
    pass


HASH_LEN = len(hashing.hash("."))


class ExpToken(Base):
    __tablename__ = "expired_tokens"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    token: Mapped[str] = mapped_column(String(TOKEN_MAX_LEN))
    __table_args__ = (UniqueConstraint("token", name="_token_uniq"),)


class UserDB(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(USERNAME_MAX_LEN))
    email: Mapped[str] = mapped_column(String(EMAIL_ADDR_MAX_LEN))
    admin: Mapped[bool] = mapped_column(Boolean, default=False)
    pass_hash: Mapped[str] = mapped_column(
        String(HASH_LEN).with_variant(CHAR(HASH_LEN), "mysql", "mariadb")
    )
    __table_args__ = (
        UniqueConstraint("username", name="_username_uniq"),
        UniqueConstraint("email", name="_email_uniq"),
    )
