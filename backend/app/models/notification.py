from typing import Annotated, Optional
from pydantic import BaseModel, StringConstraints

from app.config import CHAL_NAME_MAX_LEN, CHAL_DESC_MAX_LEN

class NotificationReg(BaseModel):
    title: Annotated[str, StringConstraints(min_length=1, max_length=CHAL_NAME_MAX_LEN)]
    content: Annotated[str, StringConstraints(min_length=1, max_length=CHAL_DESC_MAX_LEN)]
    timestamp: int

# ✨ ADD THIS NEW MODEL
class NotificationUpdate(BaseModel):
    title: Annotated[
        Optional[str], StringConstraints(min_length=1, max_length=CHAL_NAME_MAX_LEN)
    ] = None
    content: Annotated[
        Optional[str], StringConstraints(min_length=1, max_length=CHAL_DESC_MAX_LEN)
    ] = None

class Notification(BaseModel):
    id: int
    title: str
    content: str
    timestamp: int

class NotificationList(BaseModel):
    notifications: list[Notification]