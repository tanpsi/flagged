from time import time
from datetime import datetime, timedelta
from typing import Annotated

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError
from fastapi import Depends, HTTPException, status

from app.auth import JWTmgmt, hashing
from app.db import session_genr
from app.auth import bearer
from app.db.models import ExpToken, User as UserDB
from app.config import JWT_EXPIRY_TIMEDELTA


async def gen_token(username: str) -> str:
    return JWTmgmt.generate_token(
        {
            "username": username,
            "exp": int(
                (datetime.now() + timedelta(minutes=JWT_EXPIRY_TIMEDELTA)).timestamp()
            ),
        }
    )


async def verify_user_passwd(username: str, passwd: str) -> bool:
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


async def verify_token(token: Annotated[str, Depends(bearer.passwd)]) -> UserDB:
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
            user = (
                await session.execute(
                    select(UserDB).filter_by(username=token_data["username"])
                )
            ).scalar_one()
        except (KeyError, NoResultFound):
            raise exc
    if token_data["exp"] < time():
        raise exc
    return user
