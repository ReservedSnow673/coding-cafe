from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.mess_review_service import MessReviewService
from app.schemas.mess_review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    DailyAverageResponse,
)

router = APIRouter(prefix="/api/mess-reviews", tags=["mess-reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new mess review"""
    service = MessReviewService(db)
    
    # Check if user already reviewed this meal today
    if service.check_user_review_today(str(current_user.id), review_data.meal_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already reviewed {review_data.meal_type} for today",
        )
    
    review = service.create_review(str(current_user.id), review_data)
    return review


@router.get("/", response_model=List[ReviewResponse])
def get_reviews(
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    min_rating: Optional[int] = Query(None, ge=1, le=5, description="Minimum rating filter"),
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get mess reviews with optional filtering"""
    service = MessReviewService(db)
    reviews = service.get_reviews(
        meal_type=meal_type,
        min_rating=min_rating,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
    return reviews


@router.get("/today", response_model=List[ReviewResponse])
def get_today_reviews(
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get today's reviews"""
    service = MessReviewService(db)
    reviews = service.get_today_reviews(meal_type)
    return reviews


@router.get("/my-reviews", response_model=List[ReviewResponse])
def get_my_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's reviews"""
    service = MessReviewService(db)
    reviews = service.get_user_reviews(str(current_user.id), skip, limit)
    return reviews


@router.get("/averages", response_model=List[DailyAverageResponse])
def get_daily_averages(
    start_date: Optional[date] = Query(None, description="Start date (default: 7 days ago)"),
    end_date: Optional[date] = Query(None, description="End date (default: today)"),
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get daily average ratings"""
    service = MessReviewService(db)
    averages = service.get_daily_averages(start_date, end_date, meal_type)
    return averages


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific review by ID"""
    service = MessReviewService(db)
    review = service.get_review_by_id(review_id)
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: str,
    update_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a review (only by the author)"""
    service = MessReviewService(db)
    review = service.update_review(review_id, str(current_user.id), update_data)
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you don't have permission to update it",
        )
    
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a review (only by the author)"""
    service = MessReviewService(db)
    success = service.delete_review(review_id, str(current_user.id))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you don't have permission to delete it",
        )
    
    return None
