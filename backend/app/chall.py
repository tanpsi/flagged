import os
import hashlib
import tempfile
from typing import Literal
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError
from fastapi import UploadFile
from fastapi.responses import FileResponse
import aiofiles

from app.db import session_genr
from app.models.chall import (
    ChallReg,
    ChallUpdate,
    TeamForSolveForChall,
    SolveForChall,
    ChallSolves,
    FileForChall,
    Chall,
    ChallList,
)
from app.db.models import (
    User as UserDB,
    Chall as ChallDB,
    File as FileDB,
    Solve as SolveDB,
)
from app.utils import hashing
from app.config import FILE_STORE_DIR, FILE_BUFF_SIZE


async def init():
    global files_dir, files_dir_name
    if not FILE_STORE_DIR:
        files_dir = await aiofiles.tempfile.TemporaryDirectory()
        files_dir_name = files_dir.name  # type: ignore
    else:
        files_dir = None
        files_dir_name = FILE_STORE_DIR


async def cleanup():
    if isinstance(files_dir, tempfile.TemporaryDirectory):
        await files_dir.cleanup()  # type: ignore


async def create_chall(chall: ChallReg) -> None:
    async with session_genr() as session:
        async with session.begin():
            session.add(
                ChallDB(
                    name=chall.name,
                    desc=chall.desc,
                    flag=chall.flag,
                    points=chall.points,
                )
            )


async def update_chall(chall_id: int, details: ChallUpdate) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                chall = await session.get(ChallDB, chall_id)
                if not chall:
                    raise NoResultFound
                if details.name:
                    chall.name = details.name
                if details.desc:
                    chall.desc = details.desc
                if details.flag:
                    chall.flag = details.flag
                if details.points:
                    chall.points = details.points
        except IntegrityError:
            return False
    return True


async def create_file(chall_id: int, file: UploadFile) -> bool:
    name = file.filename
    sha256 = hashlib.sha256()
    async with aiofiles.tempfile.NamedTemporaryFile(
        dir=files_dir_name, suffix=".tmp", delete=False
    ) as out:
        tmp_name = out.name
        while True:
            data = await file.read(FILE_BUFF_SIZE)
            if not data:
                break
            sha256.update(data)
            await out.write(data)
    digest = sha256.hexdigest()
    try:
        os.rename(str(tmp_name), os.path.join(files_dir_name, digest))
    except OSError:
        # The file already exists, no issues!
        print("rename failed")  # remove after testing
        pass
    async with session_genr() as session:
        try:
            async with session.begin():
                session.add(FileDB(name=name, path=digest, chall_id=chall_id))
        except IntegrityError:
            return False
    return True


async def verify_flag(chall_id: int, flag: str) -> bool:
    async with session_genr() as session:
        chall = await session.get(ChallDB, chall_id)
        if not chall:
            return False
        real_flag = chall.flag
        if real_flag != flag:
            return False
    return True


async def create_solve(user_id: int, chall_id: int) -> bool:
    async with session_genr() as session:
        try:
            async with session.begin():
                if not (user := await session.get(UserDB, user_id)):
                    raise RuntimeError("Logged user not there")
                session.add(
                    SolveDB(
                        user_id=user_id,
                        team_id=(await user.awaitable_attrs.team).id,
                        chall_id=chall_id,
                        time=datetime.now(),
                    )
                )
        except IntegrityError:
            return False
    return True


async def delete_file(file_id: int):
    async with session_genr() as session:
        try:
            async with session.begin():
                file = await session.get(FileDB, file_id)
                if not file:
                    raise NoResultFound
                try:
                    os.unlink(os.path.join(files_dir_name, file.path))
                except FileNotFoundError:
                    pass
                await session.delete(file)
        except IntegrityError:
            return False
    return True


async def delete_chall(chall_id: int):
    async with session_genr() as session:
        try:
            async with session.begin():
                chall = await session.get(ChallDB, chall_id)
                if not chall:
                    raise NoResultFound
                for file in await chall.awaitable_attrs.files:
                    await session.delete(file)
                for solve in await chall.awaitable_attrs.solves:
                    await session.delete(solve)
                await session.delete(chall)
        except IntegrityError:
            return False
    return True


async def get_chall_solves_from_obj(chall: ChallDB) -> ChallSolves:
    return ChallSolves(
        solves=[
            SolveForChall(
                team=TeamForSolveForChall(
                    id=(await solve.awaitable_attrs.team).id,
                    name=(await solve.awaitable_attrs.team).name,
                ),
                points=chall.points,
                time=solve.time,
            )
            for solve in await chall.awaitable_attrs.solves
        ]
    )


async def get_chall_files(chall: ChallDB) -> list[FileForChall]:
    return [
        FileForChall(id=file.id, name=file.name)
        for file in await chall.awaitable_attrs.files
    ]


async def get_chall_from_obj(chall: ChallDB) -> Chall:
    return Chall(
        id=chall.id,
        name=chall.name,
        desc=chall.desc,
        points=chall.points,
        # --- CRITICAL CHANGE: Stop sending the flag hash to the frontend ---
        # The 'flag_hash' field is part of the Chall model but should be None
        # to prevent exposing the flag solution.
        flag_hash=None,
        # -----------------------------------------------------------------
        solved_cnt=len(await chall.awaitable_attrs.solves),
        files=await get_chall_files(chall),
    )


async def get_chall_solves(chall_id: int) -> ChallSolves:
    async with session_genr() as session:
        chall = await session.get(ChallDB, chall_id)
        if not chall:
            raise NoResultFound
        return await get_chall_solves_from_obj(chall)


async def get_chall(chall_id: int) -> Chall:
    async with session_genr() as session:
        chall = await session.get(ChallDB, chall_id)
        if not chall:
            raise NoResultFound
        return await get_chall_from_obj(chall)


async def get_chall_list() -> ChallList:
    async with session_genr() as session:
        return ChallList(
            challs=[
                await get_chall_from_obj(chall)
                for chall in await session.scalars(select(ChallDB))
            ]
        )


async def get_file(file_id: int) -> FileResponse | Literal[False]:
    async with session_genr() as session:
        file = await session.get(FileDB, file_id)
        if not file:
            return False
        print(os.path.join(files_dir_name, file.path), file.name)
        return FileResponse(
            path=os.path.join(files_dir_name, file.path), filename=file.name
        )
