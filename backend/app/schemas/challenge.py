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
    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj):
        """Convert SQLAlchemy model to Pydantic schema with UUID to string conversion"""
        if hasattr(obj, '__dict__'):
            data = {
                'user_id': str(obj.user_id),
                'user_name': obj.user_name,
                'joined_at': obj.joined_at,
                'completed': obj.completed,
                'completed_at': obj.completed_at,
                'progress': obj.progress
            }
            return cls(**data)
        return super().model_validate(obj)


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

    @classmethod
    def model_validate(cls, obj):
        """Convert SQLAlchemy model to Pydantic schema with computed fields"""
        if hasattr(obj, '__dict__'):
            # Compute is_active based on dates
            from datetime import datetime as dt, timezone
            now = dt.now(timezone.utc)
            is_active = obj.start_date <= now <= obj.end_date
            
            # Get participant count
            participant_count = len(obj.participants) if hasattr(obj, 'participants') else 0
            
            # Convert participants
            participants = []
            if hasattr(obj, 'participants') and obj.participants:
                for p in obj.participants:
                    participants.append({
                        'user_id': str(p.user_id),
                        'user_name': p.user_name,
                        'joined_at': p.joined_at,
                        'completed': p.completed,
                        'completed_at': p.completed_at,
                        'progress': p.progress
                    })
            
            data = {
                'id': str(obj.id),
                'creator_id': str(obj.creator_id),
                'creator_name': obj.creator_name,
                'title': obj.title,
                'description': obj.description,
                'challenge_type': obj.challenge_type.value if hasattr(obj.challenge_type, 'value') else obj.challenge_type,
                'difficulty': obj.difficulty.value if hasattr(obj.difficulty, 'value') else obj.difficulty,
                'points': obj.points,
                'start_date': obj.start_date,
                'end_date': obj.end_date,
                'max_participants': obj.max_participants,
                'completion_password': obj.completion_password,
                'participant_count': participant_count,
                'participants': participants,
                'is_active': is_active,
                'created_at': obj.created_at,
                'updated_at': obj.updated_at
            }
            return cls(**data)
        return super().model_validate(obj)


class LeaderboardEntry(BaseModel):
    user_id: str
    user_name: str
    total_points: int
    challenges_completed: int
