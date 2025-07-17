import time

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError

from app.models.user import (
    UserReg,
    UserUpdateInternal,
    User,
    UserPub,
    ChallForUserPub,
    UserPubList,
    UserPubForList,
)
from app.db.models import User as UserDB
from app.db import session_genr
from app.utils import hashing, JWTmgmt
from app.config import ADMIN_USER, ADMIN_PASSWORD


async def create_user(user: UserReg, admin: bool = False) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                session.add(
                    UserDB(
                        username=user.username,
                        email=user.email,
                        pass_hash=hashing.hash(user.password),
                        admin=admin,
                        email_verified=False,
                    )
                )
        except IntegrityError:
            return False
    return True


async def update_user(user_id: int, details: UserUpdateInternal) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                user = await session.get(UserDB, user_id)
                if not user:
                    raise NoResultFound
                if details.username:
                    user.username = details.username
                if details.password:
                    user.pass_hash = hashing.hash(details.password)
                if details.email:
                    if user.email != details.email:
                        user.email = details.email
                        user.email_verified = False
                if details.admin:
                    user.admin = details.admin
                if details.email_verified:
                    user.email_verified = details.email_verified
        except IntegrityError:
            return False
    return True


async def verify_user_email_token(token: str) -> bool:
    d = JWTmgmt.verify_token(token)
    if not d:
        return False
    try:
        if d["exp"] < time.time():
            return False
        user_id = d["id"]
        email = d["email"]
    except KeyError:
        return False
    async with session_genr() as session:
        async with session.begin():
            user = await session.get(UserDB, user_id)
            if not user:
                return False
            if email != user.email:
                return False
            user.email_verified = True
    return True


async def create_admin():
    await create_user(
        UserReg(username=ADMIN_USER, password=ADMIN_PASSWORD, email="admin@local.host"),
        admin=True,
    )


async def get_points_of_user(user: UserDB) -> int:
    return sum(
        [
            (await solve.awaitable_attrs.chall).points
            for solve in await user.awaitable_attrs.solves
        ]
    )


async def get_solves_of_user(user: UserDB) -> list[ChallForUserPub]:
    return [
        ChallForUserPub(
            id=(await solve.awaitable_attrs.chall).id,
            name=(await solve.awaitable_attrs.chall).name,
            points=(await solve.awaitable_attrs.chall).points,
        )
        for solve in await user.awaitable_attrs.solves
    ]


async def get_user_for_pub_list(user: UserDB) -> UserPubForList:
    if not await user.awaitable_attrs.team:
        team_id = team_name = None
    else:
        team_id = (await user.awaitable_attrs.team).id
        team_name = (await user.awaitable_attrs.team).name
    return UserPubForList(
        id=user.id,
        name=user.username,
        team_id=team_id,
        team_name=team_name,
        points=await get_points_of_user(user),
    )


async def get_user_pub_list() -> UserPubList:
    async with session_genr() as session:
        return UserPubList(
            users=[
                await get_user_for_pub_list(user)
                for user in await session.scalars(select(UserDB))
            ]
        )


async def get_user_pub_from_obj(user: UserDB) -> UserPub:
    return UserPub(
        **(await get_user_for_pub_list(user)).model_dump(),
        solves=await get_solves_of_user(user),
    )


async def get_user_pub(user_id: int) -> UserPub:
    async with session_genr() as session:
        user = await session.get(UserDB, user_id)
        if not user:
            raise NoResultFound
        return await get_user_pub_from_obj(user)


async def get_user(user_id: int) -> User:
    async with session_genr() as session:
        user = await session.get(UserDB, user_id)
        if not user:
            raise RuntimeError("Logged user's id not corresponding to a user")
        return User(
            **(await get_user_pub_from_obj(user)).model_dump(),
            admin=user.admin,
            email=user.email,
            email_verified=user.email_verified,
        )
