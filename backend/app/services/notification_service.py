from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate, NotificationUpdate


class NotificationService:
    
    @staticmethod
    def create_notification(db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification."""
        notification = Notification(**notification_data.dict())
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
        unread_only: bool = False,
        notification_type: Optional[NotificationType] = None
    ) -> List[Notification]:
        """Get notifications for a user with filters."""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        if notification_type:
            query = query.filter(Notification.type == notification_type)
        
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        """Mark a notification as read."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.commit()
            db.refresh(notification)
        
        return notification
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: UUID) -> int:
        """Mark all notifications as read for a user."""
        result = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        db.commit()
        return result
    
    @staticmethod
    def delete_notification(db: Session, notification_id: UUID, user_id: UUID) -> bool:
        """Delete a notification."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        return False
    
    @staticmethod
    def get_notification_stats(db: Session, user_id: UUID) -> dict:
        """Get notification statistics for a user."""
        total = db.query(func.count(Notification.id)).filter(
            Notification.user_id == user_id
        ).scalar()
        
        unread = db.query(func.count(Notification.id)).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).scalar()
        
        by_type = {}
        for notification_type in NotificationType:
            count = db.query(func.count(Notification.id)).filter(
                and_(
                    Notification.user_id == user_id,
                    Notification.type == notification_type
                )
            ).scalar()
            by_type[notification_type.value] = count
        
        return {
            "total": total or 0,
            "unread": unread or 0,
            "by_type": by_type
        }
    
    @staticmethod
    def create_announcement_notification(
        db: Session,
        user_ids: List[UUID],
        announcement_id: UUID,
        title: str,
        message: str
    ):
        """Create notifications for multiple users about an announcement."""
        notifications = []
        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                type=NotificationType.ANNOUNCEMENT,
                title=f"New Announcement: {title}",
                message=message,
                link=f"/announcements/{announcement_id}",
                reference_id=announcement_id
            )
            notifications.append(notification)
        
        db.add_all(notifications)
        db.commit()
        return notifications
    
    @staticmethod
    def create_message_notification(
        db: Session,
        user_id: UUID,
        sender_name: str,
        group_name: str,
        group_id: UUID
    ) -> Notification:
        """Create notification for a new message."""
        notification = Notification(
            user_id=user_id,
            type=NotificationType.MESSAGE,
            title=f"New message in {group_name}",
            message=f"{sender_name} sent a message",
            link=f"/chat/{group_id}",
            reference_id=group_id
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def create_issue_notification(
        db: Session,
        user_id: UUID,
        issue_id: UUID,
        issue_title: str,
        action: str
    ) -> Notification:
        """Create notification for issue updates."""
        notification = Notification(
            user_id=user_id,
            type=NotificationType.ISSUE,
            title=f"Issue {action}",
            message=f"Issue '{issue_title}' has been {action}",
            link=f"/issues/{issue_id}",
            reference_id=issue_id
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def create_team_notification(
        db: Session,
        user_ids: List[UUID],
        team_id: UUID,
        team_name: str,
        message: str
    ):
        """Create notifications for team members."""
        notifications = []
        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                type=NotificationType.TEAM,
                title=f"Team Update: {team_name}",
                message=message,
                link=f"/teams/{team_id}",
                reference_id=team_id
            )
            notifications.append(notification)
        
        db.add_all(notifications)
        db.commit()
        return notifications
