from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile
from fastapi.exceptions import RequestValidationError
from pydantic import StringConstraints

import app.db.models as db
from app.models.chall import ChallReg, ChallResp, SolveReg
from app.auth import verify_token
from app.chall import create_chall, create_file, create_solve, verify_flag
from app.config import FILE_NAME_MAX_LEN

router = APIRouter(
    prefix="/chall",
    tags=["challenge"],
)


@router.post("/create")
async def add_chall(user: Annotated[db.User, Depends(verify_token)], chall: ChallReg):
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    if not chall.desc:
        chall.desc = ""
    await create_chall(chall)
    return {"message": "Challenge created"}


@router.post("/add-file")
async def add_file(
    user: Annotated[db.User, Depends(verify_token)],
    chall_id: int,
    file: UploadFile,
):
    if not file.filename or len(file.filename) > FILE_NAME_MAX_LEN:
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT,
            detail="Too long/no filename",
        )
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    if not await create_file(chall_id, file):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge associated with chall_id not found",
        )
    return {"message": "File added"}


@router.post("/solve")
async def add_solve(
    user: Annotated[db.User, Depends(verify_token)], solve_data: SolveReg
):
    if not user.team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be part of a team to solve a challenge",
        )
    if not await verify_flag(solve_data.chall_id, solve_data.flag):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Flag does not match for challenge",
        )
    if not await create_solve(user.id, solve_data.chall_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already solved",
        )
    return {"message": "Challenge solved"}
