from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class AnnouncementCategory(str, Enum):
    """Categories for announcements"""
    GENERAL = "general"
    ACADEMIC = "academic"
    EVENT = "event"
    EMERGENCY = "emergency"
    HOSTEL = "hostel"
    PLACEMENT = "placement"
    CLUB = "club"


class AnnouncementPriority(str, Enum):
    """Priority levels for announcements"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class AnnouncementCreate(BaseModel):
    """Schema for creating a new announcement"""
    title: str = Field(..., min_length=1, max_length=255, description="Announcement title")
    content: str = Field(..., min_length=1, max_length=5000, description="Announcement content")
    category: AnnouncementCategory = Field(..., description="Announcement category")
    priority: AnnouncementPriority = Field(default=AnnouncementPriority.NORMAL, description="Priority level")
    target_year: Optional[int] = Field(None, ge=1, le=4, description="Target specific year (1-4), null for all")
    target_branch: Optional[str] = Field(None, max_length=50, description="Target specific branch, null for all")
    is_pinned: bool = Field(default=False, description="Pin to top of announcements")
    scheduled_at: Optional[datetime] = Field(None, description="When to publish (null for immediate)")
    expires_at: Optional[datetime] = Field(None, description="When to expire/hide (null for never)")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Mid-term Exams Schedule",
                "content": "The mid-term examinations will be held from Nov 20-25. Please check the detailed schedule on the portal.",
                "category": "academic",
                "priority": "high",
                "target_year": 2,
                "target_branch": "CSE",
                "is_pinned": True,
                "scheduled_at": None,
                "expires_at": "2025-11-26T00:00:00Z"
            }
        }


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    category: Optional[AnnouncementCategory] = None
    priority: Optional[AnnouncementPriority] = None
    target_year: Optional[int] = Field(None, ge=1, le=4)
    target_branch: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated: Mid-term Exams Schedule",
                "priority": "urgent"
            }
        }


class AnnouncementResponse(BaseModel):
    """Schema for announcement response"""
    id: UUID
    title: str
    content: str
    category: str
    priority: Optional[str] = None
    author_id: UUID
    author_name: str
    target_year: Optional[int] = None
    target_branch: Optional[str] = None
    is_active: bool
    is_pinned: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Mid-term Exams Schedule",
                "content": "The mid-term examinations will be held from Nov 20-25.",
                "category": "academic",
                "priority": "high",
                "author_id": "123e4567-e89b-12d3-a456-426614174001",
                "author_name": "Admin User",
                "target_year": 2,
                "target_branch": "CSE",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
