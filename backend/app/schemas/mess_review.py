from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class ReviewBase(BaseModel):
    meal_type: str = Field(..., description="breakfast, lunch, snack, or dinner")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    review_text: Optional[str] = Field(None, max_length=1000)
    taste_rating: Optional[int] = Field(None, ge=1, le=5)
    quantity_rating: Optional[int] = Field(None, ge=1, le=5)
    hygiene_rating: Optional[int] = Field(None, ge=1, le=5)
    variety_rating: Optional[int] = Field(None, ge=1, le=5)


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=1000)
    taste_rating: Optional[int] = Field(None, ge=1, le=5)
    quantity_rating: Optional[int] = Field(None, ge=1, le=5)
    hygiene_rating: Optional[int] = Field(None, ge=1, le=5)
    variety_rating: Optional[int] = Field(None, ge=1, le=5)


class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    user_name: str
    user_year: Optional[int]
    user_branch: Optional[str]
    review_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DailyAverageResponse(BaseModel):
    date: date
    meal_type: str
    average_rating: float
    review_count: int
    avg_taste: Optional[float]
    avg_quantity: Optional[float]
    avg_hygiene: Optional[float]
    avg_variety: Optional[float]
