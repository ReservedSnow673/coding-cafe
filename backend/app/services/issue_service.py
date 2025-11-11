from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.issue import Issue
from app.models.user import User
from app.schemas.issue import (
    IssueCreate,
    IssueUpdate,
    IssueStatusUpdate,
    IssueResponse
)


class IssueService:
    """Service for managing issues"""

    @staticmethod
    async def create_issue(
        db: AsyncSession,
        issue_data: IssueCreate,
        reporter_id: UUID
    ) -> Issue:
        """Create a new issue"""
        new_issue = Issue(
            title=issue_data.title,
            description=issue_data.description,
            category=issue_data.category,
            priority=issue_data.priority,
            location=issue_data.location,
            reporter_id=reporter_id,
            status="open"
        )
        db.add(new_issue)
        await db.commit()
        await db.refresh(new_issue)
        return new_issue

    @staticmethod
    async def get_issues(
        db: AsyncSession,
        category: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        reporter_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[IssueResponse]:
        """
        Get issues with optional filters.
        """
        # Build query
        query = (
            select(Issue, User)
            .join(User, Issue.reporter_id == User.id)
        )

        # Apply filters
        filters = []
        if category:
            filters.append(Issue.category == category)
        if status:
            filters.append(Issue.status == status)
        if priority:
            filters.append(Issue.priority == priority)
        if reporter_id:
            filters.append(Issue.reporter_id == reporter_id)

        if filters:
            query = query.where(and_(*filters))

        # Order by priority (critical first) and then by created_at (newest first)
        priority_order = {
            "critical": 1,
            "high": 2,
            "medium": 3,
            "low": 4
        }
        query = query.order_by(desc(Issue.created_at))

        # Pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        issues_data = result.all()

        # Build responses
        responses = []
        for issue, reporter in issues_data:
            # Get assigned user if exists
            assigned_to_name = None
            if issue.assigned_to:
                assigned_user_result = await db.execute(
                    select(User).where(User.id == issue.assigned_to)
                )
                assigned_user = assigned_user_result.scalar_one_or_none()
                if assigned_user:
                    assigned_to_name = assigned_user.full_name

            responses.append(
                IssueResponse(
                    id=issue.id,
                    title=issue.title,
                    description=issue.description,
                    category=issue.category,
                    priority=issue.priority,
                    status=issue.status,
                    location=issue.location,
                    reporter_id=issue.reporter_id,
                    reporter_name=reporter.full_name,
                    assigned_to=issue.assigned_to,
                    assigned_to_name=assigned_to_name,
                    created_at=issue.created_at,
                    updated_at=issue.updated_at,
                    resolved_at=issue.resolved_at
                )
            )

        # Sort by priority
        responses.sort(key=lambda x: (priority_order.get(x.priority, 5), -x.created_at.timestamp()))

        return responses

    @staticmethod
    async def get_issue_by_id(
        db: AsyncSession,
        issue_id: UUID
    ) -> Optional[IssueResponse]:
        """Get a specific issue by ID"""
        query = (
            select(Issue, User)
            .join(User, Issue.reporter_id == User.id)
            .where(Issue.id == issue_id)
        )

        result = await db.execute(query)
        data = result.one_or_none()

        if not data:
            return None

        issue, reporter = data

        # Get assigned user if exists
        assigned_to_name = None
        if issue.assigned_to:
            assigned_user_result = await db.execute(
                select(User).where(User.id == issue.assigned_to)
            )
            assigned_user = assigned_user_result.scalar_one_or_none()
            if assigned_user:
                assigned_to_name = assigned_user.full_name

        return IssueResponse(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            category=issue.category,
            priority=issue.priority,
            status=issue.status,
            location=issue.location,
            reporter_id=issue.reporter_id,
            reporter_name=reporter.full_name,
            assigned_to=issue.assigned_to,
            assigned_to_name=assigned_to_name,
            created_at=issue.created_at,
            updated_at=issue.updated_at,
            resolved_at=issue.resolved_at
        )

    @staticmethod
    async def update_issue(
        db: AsyncSession,
        issue_id: UUID,
        update_data: IssueUpdate,
        user_id: UUID,
        is_admin: bool
    ) -> Optional[Issue]:
        """Update an issue (reporter can update their own, admin can update any)"""
        result = await db.execute(
            select(Issue).where(Issue.id == issue_id)
        )
        issue = result.scalar_one_or_none()

        if not issue:
            return None

        # Check permissions
        if not is_admin and issue.reporter_id != user_id:
            return None

        # Update fields
        if update_data.title is not None:
            issue.title = update_data.title
        if update_data.description is not None:
            issue.description = update_data.description
        if update_data.category is not None:
            issue.category = update_data.category
        if update_data.priority is not None:
            issue.priority = update_data.priority
        if update_data.location is not None:
            issue.location = update_data.location
        
        # Only admin can change status
        if is_admin and update_data.status is not None:
            issue.status = update_data.status
            if update_data.status == "resolved" and issue.resolved_at is None:
                issue.resolved_at = datetime.utcnow()

        await db.commit()
        await db.refresh(issue)
        return issue

    @staticmethod
    async def update_status(
        db: AsyncSession,
        issue_id: UUID,
        status_update: IssueStatusUpdate
    ) -> Optional[Issue]:
        """Update issue status (admin only)"""
        result = await db.execute(
            select(Issue).where(Issue.id == issue_id)
        )
        issue = result.scalar_one_or_none()

        if not issue:
            return None

        issue.status = status_update.status
        if status_update.status == "resolved" and issue.resolved_at is None:
            issue.resolved_at = datetime.utcnow()

        await db.commit()
        await db.refresh(issue)
        return issue

    @staticmethod
    async def assign_issue(
        db: AsyncSession,
        issue_id: UUID,
        assigned_to: UUID
    ) -> Optional[Issue]:
        """Assign issue to a user (admin only)"""
        result = await db.execute(
            select(Issue).where(Issue.id == issue_id)
        )
        issue = result.scalar_one_or_none()

        if not issue:
            return None

        issue.assigned_to = assigned_to
        await db.commit()
        await db.refresh(issue)
        return issue
