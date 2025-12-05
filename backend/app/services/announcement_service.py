from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional
from uuid import UUID

from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse
)


class AnnouncementService:
    """Service for managing announcements"""

    @staticmethod
    def create_announcement(
        db: Session,
        announcement_data: AnnouncementCreate,
        author_id: UUID
    ) -> Announcement:
        """Create a new announcement (admin only)"""
        new_announcement = Announcement(
            title=announcement_data.title,
            content=announcement_data.content,
            category=announcement_data.category,
            priority=announcement_data.priority,
            author_id=author_id,
            target_year=announcement_data.target_year,
            target_branch=announcement_data.target_branch,
            is_active=True
        )
        db.add(new_announcement)
        db.commit()
        db.refresh(new_announcement)
        return new_announcement

    @staticmethod
    def get_announcements(
        db: Session,
        user_year: Optional[int] = None,
        user_branch: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[AnnouncementResponse]:
        """
        Get announcements filtered by optional category.
        Returns all active announcements.
        """
        # Build query
        query = db.query(Announcement, User).join(User, Announcement.posted_by == User.id).filter(Announcement.is_active == True)

        # Filter by category if provided
        if category:
            query = query.filter(Announcement.category == category)

        # Order by pinned first, then by created_at (newest first)
        query = query.order_by(desc(Announcement.is_pinned), desc(Announcement.created_at))

        # Pagination
        query = query.offset(skip).limit(limit)

        announcements_data = query.all()

        # Build responses
        responses = [
            AnnouncementResponse(
                id=announcement.id,
                title=announcement.title,
                content=announcement.content,
                category=announcement.category.value if hasattr(announcement.category, 'value') else announcement.category,
                priority=None,  # Field doesn't exist in model
                author_id=announcement.posted_by,
                author_name=user.full_name,
                target_year=None,  # Field doesn't exist in model
                target_branch=None,  # Field doesn't exist in model
                is_active=announcement.is_active,
                is_pinned=announcement.is_pinned,
                scheduled_at=announcement.scheduled_at,
                expires_at=announcement.expires_at,
                created_at=announcement.created_at,
                updated_at=announcement.updated_at
            )
            for announcement, user in announcements_data
        ]

        return responses

    @staticmethod
    def get_announcement_by_id(
        db: Session,
        announcement_id: UUID
    ) -> Optional[AnnouncementResponse]:
        """Get a specific announcement by ID"""
        data = db.query(Announcement, User).join(User, Announcement.posted_by == User.id).filter(Announcement.id == announcement_id).first()

        if not data:
            return None

        announcement, user = data

        return AnnouncementResponse(
            id=announcement.id,
            title=announcement.title,
            content=announcement.content,
            category=announcement.category.value if hasattr(announcement.category, 'value') else announcement.category,
            priority=None,  # Field doesn't exist in model
            author_id=announcement.posted_by,
            author_name=user.full_name,
            target_year=None,  # Field doesn't exist in model
            target_branch=None,  # Field doesn't exist in model
            is_active=announcement.is_active,
            is_pinned=announcement.is_pinned,
            scheduled_at=announcement.scheduled_at,
            expires_at=announcement.expires_at,
            created_at=announcement.created_at,
            updated_at=announcement.updated_at
        )

    @staticmethod
    def update_announcement(
        db: Session,
        announcement_id: UUID,
        update_data: AnnouncementUpdate
    ) -> Optional[Announcement]:
        """Update an announcement (admin only)"""
        announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()

        if not announcement:
            return None

        # Update fields
        if update_data.title is not None:
            announcement.title = update_data.title
        if update_data.content is not None:
            announcement.content = update_data.content
        if update_data.category is not None:
            announcement.category = update_data.category
        if update_data.is_active is not None:
            announcement.is_active = update_data.is_active

        db.commit()
        db.refresh(announcement)
        return announcement

    @staticmethod
    def delete_announcement(
        db: Session,
        announcement_id: UUID
    ) -> bool:
        """Soft delete an announcement (set is_active to False)"""
        announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()

        if not announcement:
            return False

        announcement.is_active = False
        db.commit()
        return True
