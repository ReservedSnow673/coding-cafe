from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum
from app.schemas.building import BuildingResponse


class VisibilityEnum(str, Enum):
    """Visibility levels for location sharing"""
    PUBLIC = "public"
    FRIENDS = "friends"
    PRIVATE = "private"


class LocationCreate(BaseModel):
    """Schema for creating a new location"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    address: Optional[str] = Field(None, max_length=500, description="Human-readable address")
    visibility: VisibilityEnum = Field(default=VisibilityEnum.FRIENDS, description="Who can see this location")

    @field_validator('latitude', 'longitude')
    @classmethod
    def validate_coordinates(cls, v):
        if v is None:
            raise ValueError('Coordinate cannot be None')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 30.7333,
                "longitude": 76.7794,
                "address": "Plaksha University, Mohali, Punjab",
                "visibility": "friends"
            }
        }


class LocationUpdate(BaseModel):
    """Schema for updating location"""
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")
    address: Optional[str] = Field(None, max_length=500, description="Human-readable address")
    visibility: Optional[VisibilityEnum] = Field(None, description="Who can see this location")
    is_active: Optional[bool] = Field(None, description="Whether location sharing is active")

    class Config:
        json_schema_extra = {
            "example": {
                "visibility": "private",
                "is_active": True
            }
        }


class LocationResponse(BaseModel):
    """Schema for location response"""
    id: UUID
    user_id: UUID
    building_id: Optional[UUID]
    latitude: float
    longitude: float
    address: Optional[str]
    visibility: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    building: Optional[BuildingResponse] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "building_id": "123e4567-e89b-12d3-a456-426614174002",
                "latitude": 30.7333,
                "longitude": 76.7794,
                "address": "Plaksha University, Mohali, Punjab",
                "visibility": "friends",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "building": None
            }
        }


class UserInfo(BaseModel):
    """Basic user information"""
    id: UUID
    full_name: str
    email: str
    profile_picture: Optional[str] = None
    
    class Config:
        from_attributes = True


class LocationWithUser(BaseModel):
    """Location with user and building information"""
    id: UUID
    user_id: UUID
    building_id: Optional[UUID]
    latitude: float
    longitude: float
    address: Optional[str]
    visibility: str
    is_active: bool
    user: UserInfo
    building: Optional[BuildingResponse] = None
    
    class Config:
        from_attributes = True


class NearbyUserResponse(BaseModel):
    """Schema for nearby user response"""
    user_id: UUID
    full_name: str
    year: Optional[int]
    branch: Optional[str]
    latitude: float
    longitude: float
    address: Optional[str]
    distance_km: float
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "full_name": "John Doe",
                "year": 2,
                "branch": "CSE",
                "latitude": 30.7333,
                "longitude": 76.7794,
                "address": "Plaksha University",
                "distance_km": 0.5,
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class LocationShareRequest(BaseModel):
    """Schema for enabling/disabling location sharing"""
    is_active: bool = Field(..., description="Enable or disable location sharing")

    class Config:
        json_schema_extra = {
            "example": {
                "is_active": True
            }
        }
