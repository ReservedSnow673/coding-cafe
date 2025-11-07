from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ChatGroupCreate(BaseModel):
    """Schema for creating a new chat group"""
    name: str = Field(..., min_length=1, max_length=255, description="Group name")
    description: Optional[str] = Field(None, max_length=1000, description="Group description")
    member_ids: Optional[List[UUID]] = Field(default=[], description="Initial member user IDs to add")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "CSE Year 2 Group",
                "description": "Group chat for CSE 2nd year students",
                "member_ids": []
            }
        }


class ChatGroupUpdate(BaseModel):
    """Schema for updating chat group details"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Updated Group Name",
                "description": "Updated description"
            }
        }


class ChatGroupResponse(BaseModel):
    """Schema for chat group response"""
    id: UUID
    name: str
    description: Optional[str]
    created_by: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    member_count: Optional[int] = 0
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "CSE Year 2 Group",
                "description": "Group chat for CSE students",
                "created_by": "123e4567-e89b-12d3-a456-426614174001",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "member_count": 15,
                "last_message": "Hey everyone!",
                "last_message_at": "2024-01-01T12:00:00Z"
            }
        }


class ChatMessageCreate(BaseModel):
    """Schema for creating a new message"""
    content: str = Field(..., min_length=1, max_length=5000, description="Message content")
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Hello everyone! How's the project going?"
            }
        }


class ChatMessageResponse(BaseModel):
    """Schema for chat message response"""
    id: UUID
    group_id: UUID
    user_id: UUID
    content: str
    created_at: datetime
    user_name: str
    user_year: Optional[int] = None
    user_branch: Optional[str] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "group_id": "123e4567-e89b-12d3-a456-426614174001",
                "user_id": "123e4567-e89b-12d3-a456-426614174002",
                "content": "Hello everyone!",
                "created_at": "2024-01-01T12:00:00Z",
                "user_name": "John Doe",
                "user_year": 2,
                "user_branch": "CSE"
            }
        }


class ChatMemberAdd(BaseModel):
    """Schema for adding members to a group"""
    user_ids: List[UUID] = Field(..., min_length=1, description="List of user IDs to add")

    class Config:
        json_schema_extra = {
            "example": {
                "user_ids": ["123e4567-e89b-12d3-a456-426614174001"]
            }
        }


class ChatMemberResponse(BaseModel):
    """Schema for chat member response"""
    user_id: UUID
    full_name: str
    email: str
    year: Optional[int] = None
    branch: Optional[str] = None
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "full_name": "John Doe",
                "email": "john@plaksha.edu.in",
                "year": 2,
                "branch": "CSE",
                "role": "student",
                "joined_at": "2024-01-01T00:00:00Z"
            }
        }


class ChatGroupDetailResponse(ChatGroupResponse):
    """Extended schema with members list"""
    members: List[ChatMemberResponse] = []
    
    class Config:
        from_attributes = True
