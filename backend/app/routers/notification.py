import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
# ✨ IMPORT NoResultFound
from sqlalchemy.exc import NoResultFound

import app.db.models as db
# ✨ IMPORT NotificationUpdate
from app.models.notification import NotificationReg, NotificationUpdate, NotificationList
from app.auth import verify_token
# ✨ IMPORT THE NEW LOGIC FUNCTIONS
from app.notification import (
    create_notification,
    get_all_notifications,
    update_notification,
    delete_notification,
)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)

@router.post("/add")
async def add_notification(
    user: Annotated[db.User, Depends(verify_token)],
    notification_data: NotificationReg,
):
    """
    Endpoint to create a new notification. Only accessible by admins.
    """
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    
    notification_data.timestamp = int(time.time())

    await create_notification(notification_data)
    return {"message": "Notification created"}

@router.get("/")
async def get_notifications() -> NotificationList:
    """
    Endpoint to fetch all notifications.
    """
    notifications = await get_all_notifications()
    return NotificationList(notifications=notifications)

# ✨ ADD THIS ENDPOINT TO UPDATE A NOTIFICATION
@router.put("/{notification_id}/update")
async def change_notification_details(
    notification_id: int,
    user: Annotated[db.User, Depends(verify_token)],
    notification_data: NotificationUpdate,
):
    """
    Endpoint to update a notification. Only accessible by admins.
    """
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    try:
        await update_notification(notification_id, notification_data)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return {"message": "Notification updated"}

# ✨ ADD THIS ENDPOINT TO DELETE A NOTIFICATION
@router.delete("/{notification_id}/delete")
async def remove_notification(
    notification_id: int, user: Annotated[db.User, Depends(verify_token)]
):
    """
    Endpoint to delete a notification. Only accessible by admins.
    """
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User unauthorized for this action",
        )
    try:
        await delete_notification(notification_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return {"message": "Notification deleted"}