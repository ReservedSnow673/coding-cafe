from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, CheckConstraint, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class ChallengeType(str, enum.Enum):
    FITNESS = "fitness"
    ACADEMIC = "academic"
    SOCIAL = "social"
    CREATIVE = "creative"
    ENVIRONMENTAL = "environmental"
    WELLNESS = "wellness"


class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Challenge(Base):
    __tablename__ = "challenges"
    __table_args__ = (
        CheckConstraint('end_date > start_date', name='chk_challenge_dates'),
        CheckConstraint('points >= 0 AND points <= 1000', name='chk_points_range'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_name = Column(String(255), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    challenge_type = Column(SQLEnum(ChallengeType, name='challenge_type'), nullable=False, index=True)
    difficulty = Column(SQLEnum(DifficultyLevel, name='difficulty_level'), nullable=False, index=True)
    points = Column(Integer, default=0, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False, index=True)
    end_date = Column(DateTime(timezone=True), nullable=False, index=True)
    max_participants = Column(Integer, nullable=True)
    completion_password = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", backref="created_challenges")
    participants = relationship("ChallengeParticipant", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"
    __table_args__ = (
        UniqueConstraint('challenge_id', 'user_id', name='unique_challenge_participant'),
        CheckConstraint('progress >= 0 AND progress <= 100', name='chk_progress_range'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Integer, default=0, nullable=False)

    # Relationships
    challenge = relationship("Challenge", back_populates="participants")
    user = relationship("User", backref="challenge_participations")
