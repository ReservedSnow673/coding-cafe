from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class IssueCategory(str, Enum):
    """Categories for issues"""
    INFRASTRUCTURE = "infrastructure"
    ACADEMICS = "academics"
    HOSTEL = "hostel"
    MESS = "mess"
    INTERNET = "internet"
    SECURITY = "security"
    SPORTS = "sports"
    OTHER = "other"


class IssueStatus(str, Enum):
    """Status for issues"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IssuePriority(str, Enum):
    """Priority levels for issues"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueCreate(BaseModel):
    """Schema for creating a new issue"""
    title: str = Field(..., min_length=1, max_length=255, description="Issue title")
    description: str = Field(..., min_length=1, max_length=2000, description="Issue description")
    category: IssueCategory = Field(..., description="Issue category")
    priority: IssuePriority = Field(default=IssuePriority.MEDIUM, description="Priority level")
    location: Optional[str] = Field(None, max_length=255, description="Location of the issue")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Broken AC in Room 204",
                "description": "The air conditioner in hostel room 204 has stopped working. It's not cooling at all.",
                "category": "hostel",
                "priority": "high",
                "location": "Hostel A, Room 204"
            }
        }


class IssueUpdate(BaseModel):
    """Schema for updating an issue"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    category: Optional[IssueCategory] = None
    priority: Optional[IssuePriority] = None
    location: Optional[str] = Field(None, max_length=255)
    status: Optional[IssueStatus] = None

    class Config:
        json_schema_extra = {
            "example": {
                "status": "in_progress",
                "priority": "high"
            }
        }


class IssueStatusUpdate(BaseModel):
    """Schema for updating issue status"""
    status: IssueStatus = Field(..., description="New status")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "resolved"
            }
        }


class IssueResponse(BaseModel):
    """Schema for issue response"""
    id: UUID
    title: str
    description: str
    category: str
    priority: str
    status: str
    location: Optional[str]
    reporter_id: UUID
    reporter_name: str
    assigned_to: Optional[UUID]
    assigned_to_name: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Broken AC in Room 204",
                "description": "The air conditioner has stopped working.",
                "category": "hostel",
                "priority": "high",
                "status": "open",
                "location": "Hostel A, Room 204",
                "reporter_id": "123e4567-e89b-12d3-a456-426614174001",
                "reporter_name": "John Doe",
                "assigned_to": None,
                "assigned_to_name": None,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "resolved_at": None
            }
        }
