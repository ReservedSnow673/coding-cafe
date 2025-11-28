from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.challenge_service import ChallengeService
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    ParticipantResponse,
    LeaderboardEntry,
)

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


@router.post("/", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    challenge_data: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new challenge"""
    service = ChallengeService(db)
    challenge = service.create_challenge(
        str(current_user.id),
        current_user.full_name,
        challenge_data
    )
    return challenge


@router.get("/", response_model=List[ChallengeResponse])
def get_challenges(
    challenge_type: Optional[str] = Query(None, description="Filter by challenge type"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get challenges with optional filtering"""
    service = ChallengeService(db)
    challenges = service.get_challenges(
        challenge_type=challenge_type,
        difficulty=difficulty,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )
    return challenges


@router.get("/active", response_model=List[ChallengeResponse])
def get_active_challenges(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get only active challenges"""
    service = ChallengeService(db)
    challenges = service.get_active_challenges(skip, limit)
    return challenges


@router.get("/my-challenges", response_model=List[ChallengeResponse])
def get_my_challenges(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get challenges created by current user"""
    service = ChallengeService(db)
    challenges = service.get_user_challenges(str(current_user.id), skip, limit)
    return challenges


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(10, ge=1, le=50, description="Number of top users to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get leaderboard of top users by points"""
    service = ChallengeService(db)
    leaderboard = service.get_leaderboard(limit)
    return leaderboard


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific challenge by ID"""
    service = ChallengeService(db)
    challenge = service.get_challenge_by_id(challenge_id)
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )
    
    return challenge


@router.put("/{challenge_id}", response_model=ChallengeResponse)
def update_challenge(
    challenge_id: str,
    update_data: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a challenge (only by the creator)"""
    service = ChallengeService(db)
    challenge = service.update_challenge(challenge_id, str(current_user.id), update_data)
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found or you don't have permission to update it",
        )
    
    return challenge


@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a challenge (only by the creator)"""
    service = ChallengeService(db)
    success = service.delete_challenge(challenge_id, str(current_user.id))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found or you don't have permission to delete it",
        )
    
    return None


@router.post("/{challenge_id}/join", response_model=ParticipantResponse)
def join_challenge(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Join a challenge"""
    service = ChallengeService(db)
    participant = service.join_challenge(
        challenge_id,
        str(current_user.id),
        current_user.full_name
    )
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot join challenge (not found, inactive, or full)",
        )
    
    return participant


@router.post("/{challenge_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_challenge(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Leave a challenge"""
    service = ChallengeService(db)
    success = service.leave_challenge(challenge_id, str(current_user.id))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not a participant of this challenge",
        )
    
    return None


@router.post("/{challenge_id}/complete", response_model=ParticipantResponse)
def complete_challenge(
    challenge_id: str,
    password: str = Query(..., description="Completion password provided by organizer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a challenge as completed (requires password from organizer)"""
    service = ChallengeService(db)
    participant = service.complete_challenge(challenge_id, str(current_user.id), password)
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password or you are not a participant of this challenge",
        )
    
    return participant


@router.put("/{challenge_id}/progress", response_model=ParticipantResponse)
def update_progress(
    challenge_id: str,
    progress: int = Query(..., ge=0, le=100, description="Progress percentage (0-100)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update challenge progress"""
    service = ChallengeService(db)
    participant = service.update_progress(challenge_id, str(current_user.id), progress)
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not a participant of this challenge",
        )
    
    return participant


@router.get("/{challenge_id}/participants", response_model=List[ParticipantResponse])
def get_participants(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all participants of a challenge"""
    service = ChallengeService(db)
    
    # Check if challenge exists
    challenge = service.get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )
    
    participants = service.get_participants(challenge_id)
    return participants
