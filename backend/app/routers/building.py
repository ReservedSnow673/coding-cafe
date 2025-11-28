from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.building import (
    BuildingCreate,
    BuildingUpdate,
    BuildingResponse,
    BuildingWithDistance
)
from app.services import building_service

router = APIRouter(prefix="/api/buildings", tags=["buildings"])


@router.post("/", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(
    building: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new building (admin only in production)."""
    return building_service.create_building(db, building)


@router.get("/", response_model=List[BuildingResponse])
def get_buildings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all buildings."""
    return building_service.get_buildings(db, skip=skip, limit=limit)


@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(
    building_id: UUID,
    db: Session = Depends(get_db)
):
    """Get building by ID."""
    building = building_service.get_building(db, building_id)
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    return building


@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: UUID,
    building_update: BuildingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a building (admin only in production)."""
    building = building_service.update_building(db, building_id, building_update)
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )
    return building


@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a building (admin only in production)."""
    success = building_service.delete_building(db, building_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )


@router.get("/nearest/{latitude}/{longitude}", response_model=BuildingWithDistance)
def get_nearest_building(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
    """Find the nearest building to given coordinates."""
    result = building_service.find_nearest_building(db, latitude, longitude)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No buildings found"
        )
    
    building, distance = result
    return BuildingWithDistance(
        **building.__dict__,
        distance_meters=distance
    )


@router.get("/radius/{latitude}/{longitude}", response_model=List[BuildingWithDistance])
def get_buildings_in_radius(
    latitude: float,
    longitude: float,
    radius: float = 500,
    db: Session = Depends(get_db)
):
    """Get all buildings within a given radius (in meters) of coordinates."""
    results = building_service.get_buildings_in_radius(db, latitude, longitude, radius)
    
    return [
        BuildingWithDistance(
            **building.__dict__,
            distance_meters=distance
        )
        for building, distance in results
    ]
