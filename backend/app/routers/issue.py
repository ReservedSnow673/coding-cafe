from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.issue_service import IssueService
from app.schemas.issue import (
    IssueCreate,
    IssueUpdate,
    IssueStatusUpdate,
    IssueResponse
)

router = APIRouter(prefix="/api/issues", tags=["issues"])


@router.post("/", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_data: IssueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new issue report.
    
    - **title**: Issue title (1-255 characters)
    - **description**: Detailed description (1-2000 characters)
    - **category**: Category (infrastructure, academics, hostel, mess, internet, security, sports, other)
    - **priority**: Priority level (low, medium, high, critical)
    - **location**: Optional location of the issue
    """
    issue = await IssueService.create_issue(db, issue_data, current_user.id)
    
    return IssueResponse(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        category=issue.category,
        priority=issue.priority,
        status=issue.status,
        location=issue.location,
        reporter_id=issue.reporter_id,
        reporter_name=current_user.full_name,
        assigned_to=issue.assigned_to,
        assigned_to_name=None,
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        resolved_at=issue.resolved_at
    )


@router.get("/", response_model=List[IssueResponse])
async def get_issues(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    my_issues: bool = Query(False, description="Show only my reported issues"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get issues with optional filters.
    
    - **category**: Filter by category
    - **status**: Filter by status (open, in_progress, resolved, closed)
    - **priority**: Filter by priority (low, medium, high, critical)
    - **my_issues**: If true, show only issues reported by current user
    
    Results are sorted by priority (critical first) and then by date (newest first).
    """
    reporter_id = current_user.id if my_issues else None
    
    issues = await IssueService.get_issues(
        db,
        category=category,
        status=status,
        priority=priority,
        reporter_id=reporter_id,
        skip=skip,
        limit=limit
    )
    return issues


@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific issue by ID.
    """
    issue = await IssueService.get_issue_by_id(db, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    return issue


@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: UUID,
    update_data: IssueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an issue.
    
    - Users can update their own issues
    - Admins can update any issue and change status
    """
    is_admin = current_user.role == "admin"
    issue = await IssueService.update_issue(
        db,
        issue_id,
        update_data,
        current_user.id,
        is_admin
    )
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found or you don't have permission to update it"
        )
    
    # Fetch full response with reporter info
    issue_response = await IssueService.get_issue_by_id(db, issue_id)
    return issue_response


@router.patch("/{issue_id}/status", response_model=IssueResponse)
async def update_issue_status(
    issue_id: UUID,
    status_update: IssueStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update issue status (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update issue status"
        )
    
    issue = await IssueService.update_status(db, issue_id, status_update)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Fetch full response
    issue_response = await IssueService.get_issue_by_id(db, issue_id)
    return issue_response


@router.patch("/{issue_id}/assign/{user_id}")
async def assign_issue(
    issue_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assign issue to a user (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign issues"
        )
    
    issue = await IssueService.assign_issue(db, issue_id, user_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    return {"message": "Issue assigned successfully"}
