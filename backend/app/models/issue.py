from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class IssueStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IssueCategory(str, enum.Enum):
    INFRASTRUCTURE = "infrastructure"
    FOOD = "food"
    MAINTENANCE = "maintenance"
    SECURITY = "security"
    OTHER = "other"


class IssuePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Issue(Base):
    __tablename__ = "issues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(IssueCategory, name='issue_category'), default=IssueCategory.OTHER, nullable=False, index=True)
    priority = Column(String(20), default="medium", nullable=False, index=True)
    status = Column(SQLEnum(IssueStatus, name='issue_status'), default=IssueStatus.OPEN, nullable=False, index=True)
    reported_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    location = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by], backref="reported_issues")
    assignee = relationship("User", foreign_keys=[assigned_to], backref="assigned_issues")
    comments = relationship("IssueComment", back_populates="issue", cascade="all, delete-orphan")


class IssueComment(Base):
    __tablename__ = "issue_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    issue = relationship("Issue", back_populates="comments")
    user = relationship("User", backref="issue_comments")
