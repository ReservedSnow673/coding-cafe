from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class TeamCategory(str, Enum):
    """Categories for teams"""
    PROJECT = "project"
    COMPETITION = "competition"
    STUDY = "study"
    SPORTS = "sports"
    CLUB = "club"
    HACKATHON = "hackathon"
    OTHER = "other"


class TeamStatus(str, Enum):
    """Status for teams"""
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class MemberRole(str, Enum):
    """Roles for team members"""
    LEADER = "leader"
    MEMBER = "member"


class TeamCreate(BaseModel):
    """Schema for creating a new team"""
    name: str = Field(..., min_length=1, max_length=100, description="Team name")
    description: str = Field(..., min_length=1, max_length=1000, description="Team description")
    category: TeamCategory = Field(..., description="Team category")
    max_members: int = Field(default=10, ge=2, le=50, description="Maximum number of members")
    is_public: bool = Field(default=True, description="Whether team is publicly visible")
    tags: Optional[List[str]] = Field(default=None, description="Tags for searchability")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "AI Research Team",
                "description": "Working on ML projects and research papers",
                "category": "project",
                "max_members": 8,
                "is_public": True,
                "tags": ["machine-learning", "research", "python"]
            }
        }


class TeamUpdate(BaseModel):
    """Schema for updating a team"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    category: Optional[TeamCategory] = None
    max_members: Optional[int] = Field(None, ge=2, le=50)
    is_public: Optional[bool] = None
    status: Optional[TeamStatus] = None
    tags: Optional[List[str]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "description": "Updated team description",
                "max_members": 10
            }
        }


class TeamMemberResponse(BaseModel):
    """Schema for team member information"""
    user_id: UUID
    full_name: str
    email: str
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class TeamResponse(BaseModel):
    """Schema for team response"""
    id: UUID
    name: str
    description: str
    category: Optional[str] = None
    status: str
    max_members: Optional[int] = None
    current_members: int
    is_public: bool
    tags: Optional[List[str]] = None
    created_by: UUID
    leader_name: str
    created_at: datetime
    updated_at: datetime
    members: Optional[List[TeamMemberResponse]] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "AI Research Team",
                "description": "Working on ML projects",
                "category": "project",
                "status": "active",
                "max_members": 8,
                "current_members": 3,
                "is_public": True,
                "tags": ["machine-learning", "research"],
                "created_by": "123e4567-e89b-12d3-a456-426614174001",
                "leader_name": "John Doe",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "members": []
            }
        }


class JoinRequestResponse(BaseModel):
    """Schema for join request response"""
    id: UUID
    team_id: UUID
    team_name: str
    user_id: UUID
    user_name: str
    status: str
    message: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
