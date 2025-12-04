from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.utils.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.services.announcement_service import AnnouncementService
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse
)

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement_data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
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
    announcement = AnnouncementService.create_announcement(
        db,
        announcement_data,
        current_user.id
    )
    
    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        category=announcement.category,
        priority="normal",
        author_id=announcement.posted_by,
        author_name=current_user.full_name,
        target_year=None,
        target_branch=None,
        is_active=announcement.is_active,
        is_pinned=announcement.is_pinned,
        scheduled_at=announcement.scheduled_at,
        expires_at=announcement.expires_at,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at
    )


@router.get("/", response_model=List[AnnouncementResponse])
def get_announcements(
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: Session = Depends(get_db),
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
    announcements = AnnouncementService.get_announcements(
        db,
        category=category,
        skip=skip,
        limit=limit
    )
    return announcements


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(
    announcement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific announcement by ID.
    """
    announcement = AnnouncementService.get_announcement_by_id(db, announcement_id)
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return announcement


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID,
    update_data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update an announcement (admin only).
    """
    announcement = AnnouncementService.update_announcement(
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
        priority="normal",
        author_id=announcement.posted_by,
        author_name=current_user.full_name,
        target_year=None,
        target_branch=None,
        is_active=announcement.is_active,
        is_pinned=announcement.is_pinned,
        scheduled_at=announcement.scheduled_at,
        expires_at=announcement.expires_at,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at
    )


@router.delete("/{announcement_id}", status_code=status.HTTP_200_OK)
def delete_announcement(
    announcement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete (deactivate) an announcement (admin only).
    """
    success = AnnouncementService.delete_announcement(db, announcement_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return {"message": "Announcement deleted successfully"}
