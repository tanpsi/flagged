from typing import Annotated
from datetime import datetime

from pydantic import BaseModel, StringConstraints

from app.config import CHAL_NAME_MAX_LEN, CHAL_DESC_MAX_LEN, FLAG_MAX_LEN


class ChallReg(BaseModel):
    name: Annotated[str, StringConstraints(min_length=1, max_length=CHAL_NAME_MAX_LEN)]
    desc: Annotated[str | None, StringConstraints(max_length=CHAL_DESC_MAX_LEN)]
    flag: Annotated[str, StringConstraints(min_length=1, max_length=FLAG_MAX_LEN)]
    points: int


class ChallUpdate(BaseModel):
    name: Annotated[
        str | None, StringConstraints(min_length=1, max_length=CHAL_NAME_MAX_LEN)
    ]
    desc: Annotated[str | None, StringConstraints(max_length=CHAL_DESC_MAX_LEN)]
    flag: Annotated[
        str | None, StringConstraints(min_length=1, max_length=FLAG_MAX_LEN)
    ]
    points: int | None


class TeamForSolveForChall(BaseModel):
    id: int
    name: str


class SolveForChall(BaseModel):
    team: TeamForSolveForChall
    points: int
    time: datetime


class ChallSolves(BaseModel):
    solves: list[SolveForChall]


class FileForChall(BaseModel):
    id: int
    name: str


class Chall(BaseModel):
    id: int
    name: str
    desc: str
    points: int
    flag_hash: str
    solved_cnt: int
    files: list[FileForChall]


class ChallList(BaseModel):
    challs: list[Chall]
