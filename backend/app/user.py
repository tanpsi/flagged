from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import NoResultFound, IntegrityError

from app.auth import hashing
from app.db import session_genr
from app.models.user import User, UserReg, UserPub, UserPubForList, ChallForUserPub, UserPubList
from app.db.models import User as UserDB
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
                    )
                )
        except IntegrityError:
            return False
        return True



async def change_user_passwd(username: str, new_passwd: str) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                user = (
                    await session.execute(select(UserDB).filter_by(username=username))
                ).scalar_one()
                user.pass_hash = hashing.hash(new_passwd)
        except NoResultFound:
            return False
    return True

async def create_admin():
    await create_user(UserReg(username=ADMIN_USER, password=ADMIN_PASSWORD, email="admin@local.host"), admin=True)

async def get_points_of_user(user: UserDB) -> int:
    return sum([(await solve.awaitable_attrs.chall).points for solve in await user.awaitable_attrs.solves])

async def get_solves_of_user(user: UserDB) -> list[ChallForUserPub]:
    return [ChallForUserPub(id=solve.chall.id, name=solve.chall.name, points=solve.chall.points) for solve in user.solves]
    

async def get_user_for_pub_list(user: UserDB) -> UserPubForList:
    if not await user.awaitable_attrs.team:
        team_id = team_name = None
    else:
        team_id = (await user.awaitable_attrs.team).id
        team_name = (await user.awaitable_attrs.team).name
    return UserPubForList(id=user.id, name=user.username, team_id=team_id, team_name=team_name, points=await get_points_of_user(user))

async def get_user_pub_list() -> UserPubList:
    async with session_genr() as session:
        return UserPubList(users=[await get_user_for_pub_list(user) for user in await session.scalars(select(UserDB))])

async def get_user_pub_(user: UserDB) -> UserPub:
    return UserPub(**(await get_user_for_pub_list(user)).model_dump(), solves=await get_solves_of_user(user))

async def get_user_pub(user_id: int) -> UserPub:
    async with session_genr() as session:
        user = await session.get(UserDB, user_id)
        if not user:
            raise ZeroDivisionError
        return await get_user_pub_(user)

async def get_user(user: UserDB) -> User:
    return User(**(await get_user_pub_(user)).model_dump(), admin=user.admin, email=user.email)

