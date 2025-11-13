from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Date, Enum as SQLEnum, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACKS = "snacks"


class MessReview(Base):
    __tablename__ = "mess_reviews"
    __table_args__ = (
        UniqueConstraint('user_id', 'meal_type', 'meal_date', name='unique_user_meal_date'),
        CheckConstraint('rating >= 1 AND rating <= 5', name='chk_rating_range'),
        CheckConstraint('taste_rating IS NULL OR (taste_rating >= 1 AND taste_rating <= 5)', name='chk_taste_range'),
        CheckConstraint('quantity_rating IS NULL OR (quantity_rating >= 1 AND quantity_rating <= 5)', name='chk_quantity_range'),
        CheckConstraint('hygiene_rating IS NULL OR (hygiene_rating >= 1 AND hygiene_rating <= 5)', name='chk_hygiene_range'),
        CheckConstraint('variety_rating IS NULL OR (variety_rating >= 1 AND variety_rating <= 5)', name='chk_variety_range'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_type = Column(SQLEnum(MealType, name='meal_type'), nullable=False, index=True)
    rating = Column(Integer, nullable=False, index=True)
    review = Column(Text, nullable=True)
    
    # Detailed ratings (optional)
    taste_rating = Column(Integer, nullable=True)
    quantity_rating = Column(Integer, nullable=True)
    hygiene_rating = Column(Integer, nullable=True)
    variety_rating = Column(Integer, nullable=True)
    
    meal_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    user = relationship("User", backref="mess_reviews")
