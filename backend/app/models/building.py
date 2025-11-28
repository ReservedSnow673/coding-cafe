from sqlalchemy import Column, String, Float, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid
from datetime import datetime
import enum


class BuildingType(str, enum.Enum):
    ACADEMIC = "academic"
    HOSTEL = "hostel"
    DINING = "dining"
    SPORTS = "sports"
    ADMINISTRATIVE = "administrative"
    RECREATIONAL = "recreational"
    LIBRARY = "library"
    OTHER = "other"


class Building(Base):
    __tablename__ = "buildings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=True, unique=True)  # e.g., "AC1", "H1"
    building_type = Column(SQLEnum(BuildingType), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)
    floor_count = Column(String(10), nullable=True)
    capacity = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
