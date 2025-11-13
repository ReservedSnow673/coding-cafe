from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ChallengeType(str, Enum):
    FITNESS = "fitness"
    ACADEMIC = "academic"
    SOCIAL = "social"
    CREATIVE = "creative"
    ENVIRONMENTAL = "environmental"
    WELLNESS = "wellness"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ChallengeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    challenge_type: ChallengeType
    difficulty: DifficultyLevel
    points: int = Field(..., ge=0, le=1000)
    start_date: datetime
    end_date: datetime
    max_participants: Optional[int] = Field(None, ge=1)
    completion_password: str = Field(..., min_length=1, max_length=100)


class ChallengeCreate(ChallengeBase):
    pass


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    challenge_type: Optional[ChallengeType] = None
    difficulty: Optional[DifficultyLevel] = None
    points: Optional[int] = Field(None, ge=0, le=1000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_participants: Optional[int] = Field(None, ge=1)
    completion_password: Optional[str] = Field(None, min_length=1, max_length=100)


class ParticipantBase(BaseModel):
    user_id: str
    user_name: str
    joined_at: datetime
    completed: bool = False
    completed_at: Optional[datetime] = None
    progress: int = Field(0, ge=0, le=100)


class ParticipantResponse(ParticipantBase):
    pass


class ChallengeResponse(ChallengeBase):
    id: str
    creator_id: str
    creator_name: str
    participant_count: int
    participants: List[ParticipantResponse] = []
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    user_id: str
    user_name: str
    total_points: int
    challenges_completed: int
