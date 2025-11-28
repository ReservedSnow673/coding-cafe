from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
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


@router.get("/analytics/overview", response_model=dict)
def get_analytics_overview(
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics overview for mess reviews"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.mess_review import MessReview, MealType
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)
    
    # Total reviews in period
    total_reviews = db.query(func.count(MessReview.id)).filter(
        MessReview.date >= start_date,
        MessReview.date <= end_date
    ).scalar()
    
    # Average rating by meal type
    ratings_by_meal = {}
    for meal_type in MealType:
        avg_rating = db.query(func.avg(MessReview.rating)).filter(
            MessReview.meal_type == meal_type,
            MessReview.date >= start_date,
            MessReview.date <= end_date
        ).scalar()
        ratings_by_meal[meal_type.value] = round(float(avg_rating or 0), 2)
    
    # Overall average
    overall_avg = db.query(func.avg(MessReview.rating)).filter(
        MessReview.date >= start_date,
        MessReview.date <= end_date
    ).scalar()
    
    # Daily trends
    daily_data = db.query(
        MessReview.date,
        func.avg(MessReview.rating).label('avg_rating'),
        func.count(MessReview.id).label('review_count')
    ).filter(
        MessReview.date >= start_date,
        MessReview.date <= end_date
    ).group_by(MessReview.date).order_by(MessReview.date).all()
    
    trends = [{
        'date': str(row.date),
        'average_rating': round(float(row.avg_rating), 2),
        'review_count': row.review_count
    } for row in daily_data]
    
    # Rating distribution
    rating_distribution = {}
    for i in range(1, 6):
        count = db.query(func.count(MessReview.id)).filter(
            MessReview.rating == i,
            MessReview.date >= start_date,
            MessReview.date <= end_date
        ).scalar()
        rating_distribution[str(i)] = count
    
    return {
        'period_days': days,
        'total_reviews': total_reviews or 0,
        'overall_average': round(float(overall_avg or 0), 2),
        'ratings_by_meal': ratings_by_meal,
        'daily_trends': trends,
        'rating_distribution': rating_distribution
    }


@router.get("/analytics/popular-dishes", response_model=List[dict])
def get_popular_dishes(
    days: int = Query(30, ge=1, le=90),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get most mentioned dishes in reviews"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.mess_review import MessReview
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)
    
    reviews = db.query(MessReview).filter(
        MessReview.date >= start_date,
        MessReview.date <= end_date,
        MessReview.dish_name.isnot(None)
    ).all()
    
    # Count dish mentions and calculate average ratings
    dish_stats = {}
    for review in reviews:
        dish = review.dish_name
        if dish:
            if dish not in dish_stats:
                dish_stats[dish] = {'count': 0, 'total_rating': 0, 'ratings': []}
            dish_stats[dish]['count'] += 1
            dish_stats[dish]['total_rating'] += review.rating
            dish_stats[dish]['ratings'].append(review.rating)
    
    # Calculate averages and sort
    popular_dishes = []
    for dish, stats in dish_stats.items():
        avg_rating = stats['total_rating'] / stats['count']
        popular_dishes.append({
            'dish_name': dish,
            'mention_count': stats['count'],
            'average_rating': round(avg_rating, 2)
        })
    
    # Sort by mention count
    popular_dishes.sort(key=lambda x: x['mention_count'], reverse=True)
    
    return popular_dishes[:limit]
