from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError
from fastapi import UploadFile
import aiofiles
import tempfile
import hashlib
import os

from app.db import session_genr
from app.models.chall import ChallReg
from app.db.models import (
    User as UserDB,
    Chall as ChallDB,
    File as FileDB,
    Solve as SolveDB,
)
from app.config import FILE_STORE_DIR, FILE_BUFF_SIZE


async def init():
    global files_dir
    if not FILE_STORE_DIR:
        files_dir = await aiofiles.tempfile.TemporaryDirectory()
    else:
        files_dir = FILE_STORE_DIR


async def cleanup():
    if isinstance(files_dir, tempfile.TemporaryDirectory):
        await files_dir.cleanup()


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


async def create_file(chall_id: int, file: UploadFile) -> bool:
    name = file.filename
    sha256 = hashlib.sha256()
    async with aiofiles.tempfile.NamedTemporaryFile(
        dir=files_dir.name, suffix=".tmp", delete=False
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
        os.rename(str(tmp_name), os.path.join(files_dir.name, digest))
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
                    )
                )
        except IntegrityError:
            return False
    return True


async def remove_file():
    pass
