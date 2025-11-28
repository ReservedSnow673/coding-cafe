from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime
import enum


class NotificationType(str, enum.Enum):
    ANNOUNCEMENT = "announcement"
    MESSAGE = "message"
    ISSUE = "issue"
    TEAM = "team"
    CHALLENGE = "challenge"
    MESS_REVIEW = "mess_review"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)  # URL to navigate to
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    
    # Additional metadata stored as JSON-like string
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # ID of related entity
    
    # Relationships
    user = relationship("User", backref="notifications")
