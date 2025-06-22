from typing import Annotated, Literal, Optional

from pydantic import BaseModel, StringConstraints

from app.config import CHAL_NAME_MAX_LEN, CHAL_DESC_MAX_LEN, FLAG_MAX_LEN


class ChallReg(BaseModel):
    name: Annotated[str, StringConstraints(min_length=1, max_length=CHAL_NAME_MAX_LEN)]
    desc: Optional[Annotated[str, StringConstraints(max_length=CHAL_DESC_MAX_LEN)]]
    flag: Annotated[str, StringConstraints(min_length=1, max_length=FLAG_MAX_LEN)]
    points: int


class ChallResp(BaseModel):
    name: str
    desc: str
    points: int
    solved_cnt: int


class SolveReg(BaseModel):
    chall_id: int
    flag: Annotated[str, StringConstraints(min_length=1, max_length=FLAG_MAX_LEN)]


class File(BaseModel):
    name: str
