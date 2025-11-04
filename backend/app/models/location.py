from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class LocationVisibility(str, enum.Enum):
    ALL = "all"
    FRIENDS = "friends"
    GROUP = "group"


class Location(Base):
    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Numeric(precision=10, scale=7), nullable=False)
    longitude = Column(Numeric(precision=10, scale=7), nullable=False)
    visibility = Column(SQLEnum(LocationVisibility), default=LocationVisibility.ALL, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    user = relationship("User", backref="locations")
