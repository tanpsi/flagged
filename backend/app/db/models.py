from typing import Optional
from datetime import datetime

from sqlalchemy import String, Boolean, UniqueConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.ext.asyncio import AsyncAttrs

from app.utils import hashing
import app.config as c


class Base(AsyncAttrs, DeclarativeBase):
    pass


HASH_LEN = len(hashing.hash("."))


class ExpToken(Base):
    __tablename__ = "expired_tokens"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    token: Mapped[str] = mapped_column(String(c.TOKEN_MAX_LEN))
    __table_args__ = (UniqueConstraint("token", name="exptoken_token_uniq"),)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(c.USERNAME_MAX_LEN))
    email: Mapped[str] = mapped_column(String(c.EMAIL_ADDR_MAX_LEN))
    admin: Mapped[bool] = mapped_column(Boolean)
    email_verified: Mapped[bool] = mapped_column(Boolean)
    pass_hash: Mapped[str] = mapped_column(
        String(HASH_LEN).with_variant(CHAR(HASH_LEN), "mysql", "mariadb")
    )
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"))
    team: Mapped[Optional["Team"]] = relationship(back_populates="users")
    solves: Mapped[list["Solve"]] = relationship(back_populates="user")
    __table_args__ = (
        UniqueConstraint("username", name="user_username_uniq"),
        UniqueConstraint("email", name="user_email_uniq"),
    )


class Team(Base):
    __tablename__ = "teams"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(c.TEAM_NAME_MAX_LEN))
    pass_hash: Mapped[str] = mapped_column(
        String(HASH_LEN).with_variant(CHAR(HASH_LEN), "mysql", "mariadb")
    )
    users: Mapped[list["User"]] = relationship(back_populates="team")
    solves: Mapped[list["Solve"]] = relationship(back_populates="team")
    __table_args__ = (UniqueConstraint("name", name="team_name_uniq"),)


class Chall(Base):
    __tablename__ = "challenges"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(c.CHAL_NAME_MAX_LEN))
    desc: Mapped[str] = mapped_column(String(c.CHAL_DESC_MAX_LEN))
    flag: Mapped[str] = mapped_column(String(c.FLAG_MAX_LEN))
    points: Mapped[int] = mapped_column()
    files: Mapped[list["File"]] = relationship(back_populates="chall")
    solves: Mapped[list["Solve"]] = relationship(back_populates="chall")


class File(Base):
    __tablename__ = "files"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(c.FILE_NAME_MAX_LEN))
    path: Mapped[str] = mapped_column(String(c.FILE_PATH_MAX_LEN))
    chall_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    chall: Mapped["Chall"] = relationship(back_populates="files")


class Solve(Base):
    __tablename__ = "solves"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    chall_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    time: Mapped[datetime] = mapped_column()
    user: Mapped["User"] = relationship(back_populates="solves")
    chall: Mapped["Chall"] = relationship(back_populates="solves")
    team: Mapped["Team"] = relationship(back_populates="solves")
    __table_args__ = (
        UniqueConstraint("team_id", "chall_id", name="solve_team_chall_uniq"),
    )


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(c.CHAL_NAME_MAX_LEN))
    content: Mapped[str] = mapped_column(String(c.CHAL_DESC_MAX_LEN))
    timestamp: Mapped[int] = mapped_column()
