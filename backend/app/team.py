from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound

from app.auth import hashing
from app.db import session_genr
from app.models.team import TeamReg
from app.db.models import User as UserDB, Team as TeamDB


async def new_team(team_name: str, team_passwd: str, user_name: str) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                team = TeamDB(name=team_name, pass_hash=hashing.hash(team_passwd))
                session.add(team)
                user = (
                    await session.execute(select(UserDB).filter_by(username=user_name))
                ).scalar_one()
                if not user:
                    await session.rollback()
                    return False
                team.users.append(user)
        except IntegrityError:
            return False
        return True


async def check_team_passwd(name, passwd) -> bool:
    async with session_genr() as session:
        stmt = select(TeamDB.pass_hash).filter_by(name=name)
        results = await session.execute(stmt)
        try:
            stored_hash = results.one().pass_hash
        except NoResultFound:
            return False
        if not hashing.verify(passwd, stored_hash):
            return False
        return True


async def add_user_to_team(user_name: int, team_name: str) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                team = (
                    await session.execute(select(TeamDB).filter_by(name=team_name))
                ).scalar_one()
                user = (
                    await session.execute(select(UserDB).filter_by(username=user_name))
                ).scalar_one()
                if not user.team:
                    user.team = team
                else:
                    return False
        except NoResultFound:
            return False
        return True


async def change_team_passwd(team_name: str, team_passwd: str) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                team = (
                    await session.execute(select(TeamDB).filter_by(name=team_name))
                ).scalar_one()
                team.pass_hash = hashing.hash(team_passwd)
        except NoResultFound:
            return False
    return True
