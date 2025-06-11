from time import time
from datetime import datetime, timedelta
from typing import Annotated

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError
from fastapi import Depends, HTTPException, status

from app.auth import JWTmgmt, hashing
from app.db import session_genr
from app.auth import bearer
from app.models.auth import UserReg
from app.db.models import UserDB, ExpToken
from app.config import JWT_EXPIRY_TIMEDELTA


async def gen_token(username) -> str:
    return JWTmgmt.generate_token(
        {
            "username": username,
            "exp": int(
                (datetime.now() + timedelta(minutes=JWT_EXPIRY_TIMEDELTA)).timestamp()
            ),
        }
    )


async def add_user(user: UserReg) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                session.add(
                    UserDB(
                        username=user.username,
                        email=user.email,
                        pass_hash=hashing.hash(user.password),
                    )
                )
        except IntegrityError:
            return False
        else:
            return True


async def check_user_passwd(username, passwd) -> bool:
    async with session_genr() as session:
        stmt = select(UserDB.pass_hash).filter_by(username=username)
        results = await session.execute(stmt)
        try:
            stored_hash = results.one().pass_hash
        except NoResultFound:
            return False
        if not hashing.verify(passwd, stored_hash):
            return False
        return True


async def expire_token(token: str) -> bool:
    async with session_genr() as session:
        async with session.begin():
            try:
                session.add(ExpToken(token=token))
            except IntegrityError:
                return False
            else:
                return True


async def verify_token(token: Annotated[str, Depends(bearer.passwd)]) -> str:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Bearer token invalid",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = JWTmgmt.verify_token(token)
    if not token_data:
        raise exc
    async with session_genr() as session:
        try:
            (await session.execute(select(ExpToken.id).filter_by(token=token))).one()
        except NoResultFound:
            pass
        else:
            raise exc
        try:
            (
                await session.execute(
                    select(UserDB.id).filter_by(username=token_data["username"])
                )
            ).one()
        except (KeyError, NoResultFound):
            raise exc
    if token_data["exp"] < time():
        raise exc
    return token_data["username"]
