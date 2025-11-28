from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.team_service import TeamService
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    JoinRequestResponse
)

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new team.
    
    The creator automatically becomes the team leader.
    
    - **name**: Team name (1-100 characters)
    - **description**: Team description (1-1000 characters)
    - **category**: Category (project, competition, study, sports, club, hackathon, other)
    - **max_members**: Maximum members (2-50, default 10)
    - **is_public**: Whether team is publicly visible (default true)
    - **tags**: Optional list of tags for searchability
    """
    team = await TeamService.create_team(db, team_data, current_user.id)
    
    # Fetch full response
    team_response = await TeamService.get_team_by_id(db, team.id, include_members=True)
    return team_response


@router.get("/", response_model=List[TeamResponse])
async def get_teams(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all public teams with optional filters.
    
    - **category**: Filter by category
    - **status**: Filter by status (active, completed, archived)
    - **search**: Search in team name and description
    
    Results are sorted by creation date (newest first).
    """
    teams = await TeamService.get_teams(
        db,
        category=category,
        status=status,
        search=search,
        skip=skip,
        limit=limit
    )
    return teams


@router.get("/my-teams", response_model=List[TeamResponse])
async def get_my_teams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all teams the current user is a member of.
    """
    teams = await TeamService.get_user_teams(db, current_user.id)
    return teams


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific team by ID with member list.
    """
    team = await TeamService.get_team_by_id(db, team_id, include_members=True)
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    return team


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: UUID,
    update_data: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a team (leader only).
    """
    team = await TeamService.update_team(db, team_id, update_data, current_user.id)
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you don't have permission to update it"
        )
    
    # Fetch full response
    team_response = await TeamService.get_team_by_id(db, team_id, include_members=True)
    return team_response


@router.delete("/{team_id}", status_code=status.HTTP_200_OK)
async def delete_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a team (leader only).
    
    This will remove all members and pending join requests.
    """
    success = await TeamService.delete_team(db, team_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you don't have permission to delete it"
        )
    
    return {"message": "Team deleted successfully"}


@router.post("/{team_id}/join", status_code=status.HTTP_201_CREATED)
async def request_to_join_team(
    team_id: UUID,
    message: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Request to join a team.
    
    The team leader will receive the request and can approve or reject it.
    """
    try:
        join_request = await TeamService.request_to_join(
            db,
            team_id,
            current_user.id,
            message
        )
        return {"message": "Join request sent successfully", "request_id": join_request.id}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{team_id}/leave", status_code=status.HTTP_200_OK)
async def leave_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Leave a team (members only).
    
    Team leaders cannot leave. They must transfer leadership or delete the team.
    """
    success = await TeamService.leave_team(db, team_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot leave team. Leaders must transfer leadership or delete the team."
        )
    
    return {"message": "Left team successfully"}


@router.get("/{team_id}/requests", response_model=List[JoinRequestResponse])
async def get_join_requests(
    team_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get pending join requests for a team (leader only).
    """
    requests = await TeamService.get_pending_requests(db, team_id, current_user.id)
    return requests


@router.post("/requests/{request_id}/approve", status_code=status.HTTP_200_OK)
async def approve_join_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve a join request (leader only).
    """
    success = await TeamService.handle_join_request(
        db,
        request_id,
        current_user.id,
        approve=True
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found or you don't have permission"
        )
    
    return {"message": "Join request approved"}


@router.post("/requests/{request_id}/reject", status_code=status.HTTP_200_OK)
async def reject_join_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reject a join request (leader only).
    """
    success = await TeamService.handle_join_request(
        db,
        request_id,
        current_user.id,
        approve=False
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found or you don't have permission"
        )
    
    return {"message": "Join request rejected"}
