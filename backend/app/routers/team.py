from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import NoResultFound

from app.models.team import TeamReg, TeamUpdate, TeamJoinReq, Team, TeamPub, TeamPubList
from app.db.models import User as UserDB
from app.auth import verify_token
from app.team import (
    create_team,
    add_user_to_team,
    get_team_pub,
    get_team_pub_list,
    get_team,
    update_team,
)

router = APIRouter(
    prefix="/team",
    tags=["team"],
)


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_team(user: Annotated[UserDB, Depends(verify_token)], team: TeamReg):
    try:
        if await create_team(user.id, team):
            return {"message": "Team registered"}
    except NoResultFound:
        raise RuntimeError("Logged user's id not corresponding to a user")
    except ZeroDivisionError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User already in a team"
        )
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Team name already in use",
    )


@router.put("/update")
async def change_team_details(
    user: Annotated[UserDB, Depends(verify_token)], new_details: TeamUpdate
):
    if not user.team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not in a team",
        )
    try:
        if await update_team(user.team.id, new_details):
            return {"message": "Team updated"}
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Team name already in use",
            )
    except NoResultFound:
        raise RuntimeError("Team id no corresponding to a team")


@router.put("/join")
async def join_team(user: Annotated[UserDB, Depends(verify_token)], team: TeamJoinReq):
    try:
        if not await add_user_to_team(user.id, team):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Team name and/or password does not match",
            )
        return {"message": "User added to team"}
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User already in a team"
        )


@router.get("/")
async def get_logged_user_team_details(
    user: Annotated[UserDB, Depends(verify_token)],
) -> Team:
    if not user.team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not in a team",
        )
    return await get_team(user.team.id)


@router.get("s/<team_id>")
async def get_other_team_details(team_id: int) -> TeamPub:
    try:
        return await get_team_pub(team_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No team associated with the id",
        )


@router.get("s")
async def get_team_list() -> TeamPubList:
    return await get_team_pub_list()
