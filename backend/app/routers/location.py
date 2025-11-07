from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.location import (
    LocationCreate,
    LocationUpdate,
    LocationResponse,
    NearbyUserResponse,
    LocationShareRequest
)
from app.services.location_service import LocationService

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def share_location(
    location_data: LocationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Share or update your current location.
    
    - Creates a new location entry if one doesn't exist
    - Updates existing location if already shared
    - Automatically sets location as active
    """
    location = await LocationService.create_or_update_location(
        db=db,
        user_id=current_user.id,
        location_data=location_data
    )
    return location


@router.get("/me", response_model=LocationResponse)
async def get_my_location(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get your current shared location.
    
    Returns 404 if no location has been shared yet.
    """
    location = await LocationService.get_my_location(db=db, user_id=current_user.id)
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No location found. Share your location first."
        )
    
    return location


@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    location_data: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update your location details.
    
    - Can update coordinates, address, visibility, or active status
    - Only the owner can update their location
    """
    location = await LocationService.update_location(
        db=db,
        location_id=location_id,
        user_id=current_user.id,
        location_data=location_data
    )
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found or you don't have permission to update it"
        )
    
    return location


@router.get("/nearby", response_model=List[NearbyUserResponse])
async def get_nearby_users(
    max_distance: float = Query(default=5.0, ge=0.1, le=50.0, description="Maximum distance in kilometers"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of nearby users within specified distance.
    
    - Requires you to have shared your location first
    - Only shows users who have set visibility to PUBLIC or FRIENDS
    - Results are sorted by distance (nearest first)
    - Default maximum distance is 5 km
    """
    nearby_users = await LocationService.get_nearby_users(
        db=db,
        user_id=current_user.id,
        max_distance_km=max_distance
    )
    
    return nearby_users


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def stop_sharing_location(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stop sharing your location.
    
    - Sets location as inactive instead of deleting
    - Your location history is preserved
    """
    success = await LocationService.delete_location(db=db, user_id=current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No location found to delete"
        )
    
    return None


@router.post("/toggle", response_model=LocationResponse)
async def toggle_location_sharing(
    request: LocationShareRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Enable or disable location sharing.
    
    - Quickly turn location sharing on/off
    - Preserves location data
    """
    location = await LocationService.toggle_location_sharing(
        db=db,
        user_id=current_user.id,
        is_active=request.is_active
    )
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No location found. Share your location first."
        )
    
    return location
