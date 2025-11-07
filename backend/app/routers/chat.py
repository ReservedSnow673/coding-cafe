from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.chat_service import ChatService
from app.schemas.chat import (
    ChatGroupCreate,
    ChatGroupUpdate,
    ChatGroupResponse,
    ChatGroupDetailResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatMemberAdd
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/groups", response_model=ChatGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_data: ChatGroupCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new chat group.
    
    - **name**: Group name (required, 1-255 characters)
    - **description**: Optional group description (max 1000 characters)
    - **member_ids**: Optional list of user IDs to add as initial members
    
    The creator is automatically added as an admin.
    """
    group = await ChatService.create_group(db, group_data, current_user.id)
    
    # Get member count for response
    return ChatGroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        created_by=group.created_by,
        is_active=group.is_active,
        created_at=group.created_at,
        updated_at=group.updated_at,
        member_count=len(group_data.member_ids or []) + 1,  # +1 for creator
        last_message=None,
        last_message_at=None
    )


@router.get("/groups", response_model=List[ChatGroupResponse])
async def get_my_groups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all chat groups that the current user is a member of.
    
    Returns groups ordered by most recently updated, with member counts and last message preview.
    """
    groups = await ChatService.get_user_groups(db, current_user.id)
    return groups


@router.get("/groups/{group_id}", response_model=ChatGroupDetailResponse)
async def get_group_detail(
    group_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific group, including members list.
    
    Only members of the group can access this endpoint.
    """
    group = await ChatService.get_group_detail(db, group_id, current_user.id)
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or you are not a member"
        )
    
    return group


@router.put("/groups/{group_id}", response_model=ChatGroupResponse)
async def update_group(
    group_id: UUID,
    update_data: ChatGroupUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update group details (name, description, or active status).
    
    Only group admins can update group details.
    """
    group = await ChatService.update_group(db, group_id, current_user.id, update_data)
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Group not found or you don't have permission to update it"
        )
    
    return ChatGroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        created_by=group.created_by,
        is_active=group.is_active,
        created_at=group.created_at,
        updated_at=group.updated_at,
        member_count=0,  # Will be populated by client
        last_message=None,
        last_message_at=None
    )


@router.post("/groups/{group_id}/members", status_code=status.HTTP_200_OK)
async def add_members(
    group_id: UUID,
    member_data: ChatMemberAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add new members to a group.
    
    Only group admins can add members.
    """
    success = await ChatService.add_members(
        db, 
        group_id, 
        member_data.user_ids, 
        current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to add members to this group"
        )
    
    return {"message": "Members added successfully"}


@router.delete("/groups/{group_id}/leave", status_code=status.HTTP_200_OK)
async def leave_group(
    group_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Leave a chat group.
    
    Any member can leave a group they're part of.
    """
    success = await ChatService.leave_group(db, group_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not a member of this group"
        )
    
    return {"message": "Left group successfully"}


@router.post("/groups/{group_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    group_id: UUID,
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to a chat group.
    
    Only members of the group can send messages.
    - **content**: Message content (1-5000 characters)
    """
    message = await ChatService.send_message(db, group_id, current_user.id, message_data)
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    return ChatMessageResponse(
        id=message.id,
        group_id=message.group_id,
        user_id=message.user_id,
        content=message.content,
        created_at=message.created_at,
        user_name=current_user.full_name,
        user_year=current_user.year,
        user_branch=current_user.branch
    )


@router.get("/groups/{group_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    group_id: UUID,
    limit: int = Query(50, ge=1, le=100, description="Number of messages to fetch"),
    before: Optional[datetime] = Query(None, description="Fetch messages before this timestamp (for pagination)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get messages from a chat group.
    
    Returns messages in chronological order (oldest first).
    - **limit**: Number of messages to fetch (1-100, default 50)
    - **before**: Optional timestamp for pagination - fetch messages before this time
    
    Only members of the group can view messages.
    """
    messages = await ChatService.get_messages(
        db, 
        group_id, 
        current_user.id, 
        limit, 
        before
    )
    
    return messages
