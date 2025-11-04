from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Date, Enum as SQLEnum
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


class MessReview(Base):
    __tablename__ = "mess_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    meal_type = Column(SQLEnum(MealType), nullable=False, index=True)
    taste_rating = Column(Integer, nullable=False)
    hygiene_rating = Column(Integer, nullable=False)
    service_rating = Column(Integer, nullable=False)
    portion_rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    user = relationship("User", backref="mess_reviews")
