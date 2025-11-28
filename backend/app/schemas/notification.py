from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    type: NotificationType
    title: str = Field(..., max_length=200)
    message: str
    link: Optional[str] = Field(None, max_length=500)
    reference_id: Optional[UUID] = None


class NotificationCreate(NotificationBase):
    user_id: UUID


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    total: int
    unread: int
    by_type: dict[str, int]
