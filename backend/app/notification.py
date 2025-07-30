from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from app.db import session_genr
from app.db.models import Notification as NotificationDB
from app.models.notification import NotificationReg, NotificationUpdate, Notification


async def create_notification(notification: NotificationReg) -> None:
    """
    Creates a new notification and adds it to the database.
    """
    async with session_genr() as session:
        async with session.begin():
            session.add(
                NotificationDB(
                    title=notification.title,
                    content=notification.content,
                    timestamp=notification.timestamp,
                )
            )


async def get_all_notifications() -> list[Notification]:
    """
    Retrieves all notifications from the database.
    """
    async with session_genr() as session:
        result = await session.execute(
            select(NotificationDB).order_by(NotificationDB.timestamp.desc())
        )
        notifications = result.scalars().all()
        return [
            Notification(
                id=n.id, title=n.title, content=n.content, timestamp=n.timestamp
            )
            for n in notifications
        ]


async def update_notification(
    notification_id: int, details: NotificationUpdate
) -> bool:
    """
    Updates a notification in the database.
    """
    async with session_genr() as session:
        async with session.begin():
            notification = await session.get(NotificationDB, notification_id)
            if not notification:
                raise NoResultFound

            if details.title is not None:
                notification.title = details.title
            if details.content is not None:
                notification.content = details.content
    return True


async def delete_notification(notification_id: int) -> None:
    """
    Deletes a notification from the database.
    """
    async with session_genr() as session:
        async with session.begin():
            notification = await session.get(NotificationDB, notification_id)
            if not notification:
                raise NoResultFound
            await session.delete(notification)
