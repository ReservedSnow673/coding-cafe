from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import date, datetime, timedelta
from typing import List, Optional

from app.models.mess_review import MessReview
from app.schemas.mess_review import ReviewCreate, ReviewUpdate, DailyAverageResponse


class MessReviewService:
    def __init__(self, db: Session):
        self.db = db

    def create_review(self, user_id: str, review_data: ReviewCreate) -> MessReview:
        """Create a new mess review"""
        review = MessReview(
            user_id=user_id,
            meal_type=review_data.meal_type,
            rating=review_data.rating,
            review=review_data.review_text,
            taste_rating=review_data.taste_rating,
            quantity_rating=review_data.quantity_rating,
            hygiene_rating=review_data.hygiene_rating,
            variety_rating=review_data.variety_rating,
            meal_date=date.today(),
        )
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def get_review_by_id(self, review_id: str) -> Optional[MessReview]:
        """Get a review by ID"""
        return self.db.query(MessReview).filter(MessReview.id == review_id).first()

    def get_reviews(
        self,
        meal_type: Optional[str] = None,
        min_rating: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[MessReview]:
        """Get reviews with optional filtering"""
        query = self.db.query(MessReview)

        if meal_type:
            query = query.filter(MessReview.meal_type == meal_type)
        
        if min_rating:
            query = query.filter(MessReview.rating >= min_rating)
        
        if start_date:
            query = query.filter(MessReview.meal_date >= start_date)
        
        if end_date:
            query = query.filter(MessReview.meal_date <= end_date)

        return query.order_by(desc(MessReview.created_at)).offset(skip).limit(limit).all()

    def get_user_reviews(self, user_id: str, skip: int = 0, limit: int = 20) -> List[MessReview]:
        """Get all reviews by a specific user"""
        return (
            self.db.query(MessReview)
            .filter(MessReview.user_id == user_id)
            .order_by(desc(MessReview.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_review(self, review_id: str, user_id: str, update_data: ReviewUpdate) -> Optional[MessReview]:
        """Update a review (only by the author)"""
        review = self.db.query(MessReview).filter(
            MessReview.id == review_id,
            MessReview.user_id == user_id
        ).first()

        if not review:
            return None

        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(review, field, value)

        self.db.commit()
        self.db.refresh(review)
        return review

    def delete_review(self, review_id: str, user_id: str) -> bool:
        """Delete a review (only by the author)"""
        review = self.db.query(MessReview).filter(
            MessReview.id == review_id,
            MessReview.user_id == user_id
        ).first()

        if not review:
            return False

        self.db.delete(review)
        self.db.commit()
        return True

    def get_daily_averages(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        meal_type: Optional[str] = None,
    ) -> List[DailyAverageResponse]:
        """Get daily average ratings for mess meals"""
        if not start_date:
            start_date = date.today() - timedelta(days=7)
        if not end_date:
            end_date = date.today()

        query = self.db.query(
            MessReview.meal_date,
            MessReview.meal_type,
            func.avg(MessReview.rating).label('average_rating'),
            func.count(MessReview.id).label('review_count'),
            func.avg(MessReview.taste_rating).label('avg_taste'),
            func.avg(MessReview.quantity_rating).label('avg_quantity'),
            func.avg(MessReview.hygiene_rating).label('avg_hygiene'),
            func.avg(MessReview.variety_rating).label('avg_variety'),
        ).filter(
            and_(
                MessReview.meal_date >= start_date,
                MessReview.meal_date <= end_date,
            )
        )

        if meal_type:
            query = query.filter(MessReview.meal_type == meal_type)

        query = query.group_by(MessReview.meal_date, MessReview.meal_type).order_by(
            desc(MessReview.meal_date)
        )

        results = query.all()

        return [
            DailyAverageResponse(
                date=result.meal_date,
                meal_type=result.meal_type.value,
                average_rating=round(result.average_rating, 2),
                review_count=result.review_count,
                avg_taste=round(result.avg_taste, 2) if result.avg_taste else None,
                avg_quantity=round(result.avg_quantity, 2) if result.avg_quantity else None,
                avg_hygiene=round(result.avg_hygiene, 2) if result.avg_hygiene else None,
                avg_variety=round(result.avg_variety, 2) if result.avg_variety else None,
            )
            for result in results
        ]

    def get_today_reviews(self, meal_type: Optional[str] = None) -> List[MessReview]:
        """Get today's reviews"""
        query = self.db.query(MessReview).filter(MessReview.meal_date == date.today())
        
        if meal_type:
            query = query.filter(MessReview.meal_type == meal_type)
        
        return query.order_by(desc(MessReview.created_at)).all()

    def check_user_review_today(self, user_id: str, meal_type: str) -> bool:
        """Check if user has already reviewed this meal today"""
        existing = self.db.query(MessReview).filter(
            MessReview.user_id == user_id,
            MessReview.meal_type == meal_type,
            MessReview.meal_date == date.today(),
        ).first()
        
        return existing is not None
