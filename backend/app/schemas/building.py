from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.building import BuildingType


class BuildingBase(BaseModel):
    name: str = Field(..., max_length=100)
    code: Optional[str] = Field(None, max_length=20)
    building_type: BuildingType
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    description: Optional[str] = Field(None, max_length=500)
    floor_count: Optional[str] = Field(None, max_length=10)
    capacity: Optional[str] = Field(None, max_length=50)


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    code: Optional[str] = Field(None, max_length=20)
    building_type: Optional[BuildingType] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    description: Optional[str] = Field(None, max_length=500)
    floor_count: Optional[str] = Field(None, max_length=10)
    capacity: Optional[str] = Field(None, max_length=50)


class BuildingResponse(BuildingBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BuildingWithDistance(BuildingResponse):
    distance_meters: float
