from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
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
    async def create_announcement(
        db: AsyncSession,
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
        await db.commit()
        await db.refresh(new_announcement)
        return new_announcement

    @staticmethod
    async def get_announcements(
        db: AsyncSession,
        user_year: Optional[int] = None,
        user_branch: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[AnnouncementResponse]:
        """
        Get announcements filtered by user's year/branch and optional category.
        Returns announcements targeted to:
        1. Everyone (target_year=null AND target_branch=null)
        2. User's year (target_year=user_year AND target_branch=null)
        3. User's branch (target_year=null AND target_branch=user_branch)
        4. User's specific year+branch combination
        """
        # Build query
        query = (
            select(Announcement, User)
            .join(User, Announcement.author_id == User.id)
            .where(Announcement.is_active == True)
        )

        # Filter by targeting
        if user_year is not None and user_branch is not None:
            query = query.where(
                or_(
                    # For everyone
                    and_(Announcement.target_year.is_(None), Announcement.target_branch.is_(None)),
                    # For user's year only
                    and_(Announcement.target_year == user_year, Announcement.target_branch.is_(None)),
                    # For user's branch only
                    and_(Announcement.target_year.is_(None), Announcement.target_branch == user_branch),
                    # For user's specific year+branch
                    and_(Announcement.target_year == user_year, Announcement.target_branch == user_branch)
                )
            )
        elif user_year is not None:
            query = query.where(
                or_(
                    and_(Announcement.target_year.is_(None), Announcement.target_branch.is_(None)),
                    and_(Announcement.target_year == user_year, Announcement.target_branch.is_(None))
                )
            )
        elif user_branch is not None:
            query = query.where(
                or_(
                    and_(Announcement.target_year.is_(None), Announcement.target_branch.is_(None)),
                    and_(Announcement.target_year.is_(None), Announcement.target_branch == user_branch)
                )
            )
        else:
            # No filtering, show all general announcements
            query = query.where(
                and_(Announcement.target_year.is_(None), Announcement.target_branch.is_(None))
            )

        # Filter by category if provided
        if category:
            query = query.where(Announcement.category == category)

        # Order by priority (urgent first) and then by created_at (newest first)
        priority_order = {
            "urgent": 1,
            "high": 2,
            "normal": 3,
            "low": 4
        }
        query = query.order_by(desc(Announcement.created_at))

        # Pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        announcements_data = result.all()

        # Build responses with sorting by priority
        responses = [
            AnnouncementResponse(
                id=announcement.id,
                title=announcement.title,
                content=announcement.content,
                category=announcement.category,
                priority=announcement.priority,
                author_id=announcement.author_id,
                author_name=user.full_name,
                target_year=announcement.target_year,
                target_branch=announcement.target_branch,
                is_active=announcement.is_active,
                created_at=announcement.created_at,
                updated_at=announcement.updated_at
            )
            for announcement, user in announcements_data
        ]

        # Sort by priority
        responses.sort(key=lambda x: (priority_order.get(x.priority, 5), -x.created_at.timestamp()))

        return responses

    @staticmethod
    async def get_announcement_by_id(
        db: AsyncSession,
        announcement_id: UUID
    ) -> Optional[AnnouncementResponse]:
        """Get a specific announcement by ID"""
        query = (
            select(Announcement, User)
            .join(User, Announcement.author_id == User.id)
            .where(Announcement.id == announcement_id)
        )

        result = await db.execute(query)
        data = result.one_or_none()

        if not data:
            return None

        announcement, user = data

        return AnnouncementResponse(
            id=announcement.id,
            title=announcement.title,
            content=announcement.content,
            category=announcement.category,
            priority=announcement.priority,
            author_id=announcement.author_id,
            author_name=user.full_name,
            target_year=announcement.target_year,
            target_branch=announcement.target_branch,
            is_active=announcement.is_active,
            created_at=announcement.created_at,
            updated_at=announcement.updated_at
        )

    @staticmethod
    async def update_announcement(
        db: AsyncSession,
        announcement_id: UUID,
        update_data: AnnouncementUpdate
    ) -> Optional[Announcement]:
        """Update an announcement (admin only)"""
        result = await db.execute(
            select(Announcement).where(Announcement.id == announcement_id)
        )
        announcement = result.scalar_one_or_none()

        if not announcement:
            return None

        # Update fields
        if update_data.title is not None:
            announcement.title = update_data.title
        if update_data.content is not None:
            announcement.content = update_data.content
        if update_data.category is not None:
            announcement.category = update_data.category
        if update_data.priority is not None:
            announcement.priority = update_data.priority
        if update_data.target_year is not None:
            announcement.target_year = update_data.target_year
        if update_data.target_branch is not None:
            announcement.target_branch = update_data.target_branch
        if update_data.is_active is not None:
            announcement.is_active = update_data.is_active

        await db.commit()
        await db.refresh(announcement)
        return announcement

    @staticmethod
    async def delete_announcement(
        db: AsyncSession,
        announcement_id: UUID
    ) -> bool:
        """Soft delete an announcement (set is_active to False)"""
        result = await db.execute(
            select(Announcement).where(Announcement.id == announcement_id)
        )
        announcement = result.scalar_one_or_none()

        if not announcement:
            return False

        announcement.is_active = False
        await db.commit()
        return True
