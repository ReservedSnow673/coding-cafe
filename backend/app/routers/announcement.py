from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.announcement_service import AnnouncementService
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse
)

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


def check_admin(current_user: User = Depends(get_current_user)) -> User:
    """Check if current user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    return current_user


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    """
    Create a new announcement (admin only).
    
    - **title**: Announcement title (1-255 characters)
    - **content**: Announcement content (1-5000 characters)
    - **category**: Category (general, academic, event, emergency, hostel, placement, club)
    - **priority**: Priority level (low, normal, high, urgent)
    - **target_year**: Optional, target specific year (1-4)
    - **target_branch**: Optional, target specific branch
    
    If both target_year and target_branch are null, announcement is visible to everyone.
    """
    announcement = await AnnouncementService.create_announcement(
        db,
        announcement_data,
        current_user.id
    )
    
    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        category=announcement.category,
        priority=announcement.priority,
        author_id=announcement.author_id,
        author_name=current_user.full_name,
        target_year=announcement.target_year,
        target_branch=announcement.target_branch,
        is_active=announcement.is_active,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at
    )


@router.get("/", response_model=List[AnnouncementResponse])
async def get_announcements(
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get announcements filtered by user's year/branch and optional category.
    
    Returns announcements targeted to:
    - Everyone (no specific targeting)
    - User's year
    - User's branch
    - User's specific year+branch combination
    
    Results are sorted by priority (urgent first) and then by date (newest first).
    """
    announcements = await AnnouncementService.get_announcements(
        db,
        user_year=current_user.year,
        user_branch=current_user.branch,
        category=category,
        skip=skip,
        limit=limit
    )
    return announcements


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific announcement by ID.
    """
    announcement = await AnnouncementService.get_announcement_by_id(db, announcement_id)
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return announcement


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: UUID,
    update_data: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    """
    Update an announcement (admin only).
    """
    announcement = await AnnouncementService.update_announcement(
        db,
        announcement_id,
        update_data
    )
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        category=announcement.category,
        priority=announcement.priority,
        author_id=announcement.author_id,
        author_name=current_user.full_name,
        target_year=announcement.target_year,
        target_branch=announcement.target_branch,
        is_active=announcement.is_active,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at
    )


@router.delete("/{announcement_id}", status_code=status.HTTP_200_OK)
async def delete_announcement(
    announcement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    """
    Delete (deactivate) an announcement (admin only).
    """
    success = await AnnouncementService.delete_announcement(db, announcement_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return {"message": "Announcement deleted successfully"}
