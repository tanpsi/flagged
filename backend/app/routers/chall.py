from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile
from sqlalchemy.exc import NoResultFound
from pydantic import StringConstraints

import app.db.models as db
from app.models.chall import ChallReg, ChallUpdate, ChallSolves, Chall, ChallList
from app.auth import verify_token
from app.chall import (
    create_chall,
    update_chall,
    create_file,
    create_solve,
    verify_flag,
    delete_chall,
    delete_file,
    get_chall,
    get_chall_list,
    get_chall_solves,
    get_file,
)
from app.config import FILE_NAME_MAX_LEN, FLAG_MAX_LEN

router = APIRouter(
    prefix="/chall",
    tags=["challenge"],
)


@router.post("/add")
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


@router.put("s/{chall_id}/update")
async def change_chall_details(
    chall_id: int, user: Annotated[db.User, Depends(verify_token)], chall: ChallUpdate
):
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    try:
        await update_chall(chall_id, chall)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )
    return {"message": "Challenge updated"}


@router.delete("s/{chall_id}/delete")
async def remove_chall(user: Annotated[db.User, Depends(verify_token)], chall_id: int):
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    try:
        await delete_chall(chall_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )
    return {"message": "Challenge deleted"}


@router.post("s/{chall_id}/file/add")
async def add_file(
    chall_id: int,
    user: Annotated[db.User, Depends(verify_token)],
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


@router.post("s/{chall_id}/file/{file_id}/delete")
async def remove_file(
    user: Annotated[db.User, Depends(verify_token)], chall_id: int, file_id: int
):
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    try:
        await delete_file(file_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge/File not found",
        )
    return {"message": "File deleted"}


@router.get("s/{chall_id}/file/{file_id}")
async def get_file_of_chall(chall_id: int, file_id: int):
    resp = await get_file(file_id)
    if not resp:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
        )
    return resp


@router.post("s/{chall_id}/solve")
async def add_solve(
    user: Annotated[db.User, Depends(verify_token)],
    chall_id: int,
    flag: Annotated[str, StringConstraints(min_length=1, max_length=FLAG_MAX_LEN)],
):
    if not user.team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be part of a team to solve a challenge",
        )
    if not await verify_flag(chall_id, flag):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Flag does not match for challenge",
        )
    if not await create_solve(user.id, chall_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already solved",
        )
    return {"message": "Challenge solved"}


@router.get("s/")
async def get_list_of_challs() -> ChallList:
    return await get_chall_list()


@router.get("s/{chall_id}")
async def get_chall_details(chall_id: int) -> Chall:
    try:
        return await get_chall(chall_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
        )


@router.get("s/{chall_id}/solves")
async def get_solves_of_chall(chall_id: int) -> ChallSolves:
    try:
        return await get_chall_solves(chall_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
        )
