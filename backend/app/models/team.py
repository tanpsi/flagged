from typing import Annotated

from pydantic import BaseModel, StringConstraints

from app.config import TEAM_NAME_MAX_LEN, PASSWORD_MAX_LEN


class TeamReg(BaseModel):
    name: Annotated[str, StringConstraints(min_length=1, max_length=TEAM_NAME_MAX_LEN)]
    password: Annotated[
        str, StringConstraints(min_length=1, max_length=PASSWORD_MAX_LEN)
    ]


class TeamUpdate(BaseModel):
    name: Annotated[
        str | None, StringConstraints(min_length=1, max_length=TEAM_NAME_MAX_LEN)
    ]
    password: Annotated[
        str | None, StringConstraints(min_length=1, max_length=PASSWORD_MAX_LEN)
    ]


class TeamJoinReq(TeamReg):
    pass


class TeamPubForList(BaseModel):
    id: int
    name: str
    points: int


class TeamPubList(BaseModel):
    teams: list[TeamPubForList]


class ChallForTeamPub(BaseModel):
    id: int
    name: str
    points: int


class UserForTeamPub(BaseModel):
    id: int
    username: str
    points: int


class TeamPub(TeamPubForList):
    users: list[UserForTeamPub]
    solves: list[ChallForTeamPub]


class Team(TeamPub):
    pass
