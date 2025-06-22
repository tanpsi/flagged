from typing import Annotated

from pydantic import BaseModel, StringConstraints

from app.config import TEAM_NAME_MAX_LEN, PASSWORD_MAX_LEN


class TeamReg(BaseModel):
    name: Annotated[str, StringConstraints(min_length=1, max_length=TEAM_NAME_MAX_LEN)]
    password: Annotated[
        str, StringConstraints(min_length=1, max_length=PASSWORD_MAX_LEN)
    ]


class TeamPub(TeamReg):
    pass


class Team(TeamPub):
    pass
