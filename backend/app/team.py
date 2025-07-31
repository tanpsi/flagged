from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError

from app.models.team import (
    TeamReg,
    TeamUpdate,
    TeamJoinReq,
    Team,
    TeamPub,
    UserForTeamPub,
    ChallForTeamPub,
    TeamPubList,
    TeamPubForList,
)
from app.db.models import User as UserDB, Team as TeamDB
from app.db import session_genr
from app.utils import hashing


async def create_team(user_id: int, team_details: TeamReg) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                team = TeamDB(
                    name=team_details.name,
                    pass_hash=hashing.hash(team_details.password),
                )
                session.add(team)
                user = await session.get(UserDB, user_id)
                if not user:
                    raise NoResultFound
                if not await user.awaitable_attrs.team:
                    (await team.awaitable_attrs.users).append(user)
                else:
                    raise ZeroDivisionError
        except IntegrityError:
            return False
    return True


async def delete_team(team_id: int) -> bool:
    async with session_genr() as session:
        async with session.begin():
            team = await session.get(TeamDB, team_id)
            if not team:
                return False

            # Delete all solves associated with the team
            for solve in await team.awaitable_attrs.solves:
                await session.delete(solve)

            # Disassociate all users from the team
            for user in await team.awaitable_attrs.users:
                user.team_id = None

            # --- ADD THIS LINE TO DELETE THE TEAM RECORD ITSELF ---
            await session.delete(team)

    return True

async def update_team(team_id: int, details: TeamUpdate) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                team = await session.get(TeamDB, team_id)
                if not team:
                    raise NoResultFound
                if details.name:
                    team.name = details.name
                if details.password:
                    team.pass_hash = hashing.hash(details.password)
        except IntegrityError:
            return False
    return True


async def check_team_passwd(team_id: int, passwd) -> bool:
    async with session_genr() as session:
        team = await session.get(TeamDB, team_id)
        if not team:
            raise NoResultFound
        if not hashing.verify(passwd, team.pass_hash):
            return False
    return True


async def add_user_to_team(
    user_id: int, details: TeamJoinReq, check_pass: bool = True
) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                team = (
                    await session.execute(select(TeamDB).filter_by(name=details.name))
                ).scalar_one()
                user = await session.get(UserDB, user_id)
                if not user:
                    raise RuntimeError("User id not corresponding to a user")
                if check_pass and not await check_team_passwd(
                    team.id, details.password
                ):
                    return False
                if not user.team:
                    user.team = team
                else:
                    raise ZeroDivisionError
        except NoResultFound:
            return False
        except ZeroDivisionError:
            raise NoResultFound
    return True


async def unlink_user_from_team(
    user_id: int, caller_user_id: int | None = None
) -> bool:
    async with session_genr() as session:
        async with session.begin():
            user = await session.get(UserDB, user_id)
            if not user:
                return False
            if not user.team_id:
                return False
            if len(await (await user.awaitable_attrs.team).awaitable_attrs.users) == 1:  # type: ignore
                return False
            if caller_user_id:
                caller_user = await session.get(UserDB, user_id)
                if not caller_user:
                    return False
                if caller_user.team_id != user.team_id:
                    return False
            for solve in await user.awaitable_attrs.solves:
                await session.delete(solve)
            user.team_id = None
    return True


async def get_points_of_team(team: TeamDB) -> int:
    return sum(
        [
            (await solve.awaitable_attrs.chall).points
            for solve in await team.awaitable_attrs.solves
        ]
    )


async def get_points_of_user(user: UserDB) -> int:
    return sum(
        [
            (await solve.awaitable_attrs.chall).points
            for solve in await user.awaitable_attrs.solves
        ]
    )


async def get_solves_of_team(team: TeamDB) -> list[ChallForTeamPub]:
    return [
        ChallForTeamPub(
            id=(await solve.awaitable_attrs.chall).id,
            name=(await solve.awaitable_attrs.chall).name,
            points=(await solve.awaitable_attrs.chall).points,
        )
        for solve in await team.awaitable_attrs.solves
    ]


async def get_users_of_team(team: TeamDB) -> list[UserForTeamPub]:
    return [
        UserForTeamPub(
            id=user.id, username=user.username, points=await get_points_of_user(user)
        )
        for user in await team.awaitable_attrs.users
    ]


async def get_team_for_pub_list(team: TeamDB) -> TeamPubForList:
    return TeamPubForList(
        id=team.id,
        name=team.name,
        points=await get_points_of_team(team),
    )


async def get_team_pub_list() -> TeamPubList:
    async with session_genr() as session:
        return TeamPubList(
            teams=[
                await get_team_for_pub_list(team)
                for team in await session.scalars(select(TeamDB))
            ]
        )


async def get_team_pub_from_obj(team: TeamDB) -> TeamPub:
    return TeamPub(
        **(await get_team_for_pub_list(team)).model_dump(),
        users=await get_users_of_team(team),
        solves=await get_solves_of_team(team),
    )


async def get_team_pub(team_id: int) -> TeamPub:
    async with session_genr() as session:
        team = await session.get(TeamDB, team_id)
        if not team:
            raise NoResultFound
        return await get_team_pub_from_obj(team)


async def get_team(team_id: int) -> Team:
    async with session_genr() as session:
        team = await session.get(TeamDB, team_id)
        if not team:
            raise NoResultFound
        return Team(**(await get_team_pub_from_obj(team)).model_dump())
