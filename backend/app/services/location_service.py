from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from math import radians, cos, sin, asin, sqrt

from app.models.location import Location, VisibilityLevel
from app.models.user import User
from app.schemas.location import LocationCreate, LocationUpdate, NearbyUserResponse


class LocationService:
    """Service for managing location sharing"""

    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on the earth (specified in decimal degrees)
        Returns distance in kilometers
        """
        # Convert decimal degrees to radians
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r

    @staticmethod
    async def create_or_update_location(
        db: AsyncSession,
        user_id: UUID,
        location_data: LocationCreate
    ) -> Location:
        """Create a new location or update existing one for a user"""
        # Check if user already has a location
        result = await db.execute(
            select(Location).where(Location.user_id == user_id)
        )
        existing_location = result.scalar_one_or_none()

        if existing_location:
            # Update existing location
            existing_location.latitude = location_data.latitude
            existing_location.longitude = location_data.longitude
            existing_location.address = location_data.address
            existing_location.visibility = location_data.visibility
            existing_location.is_active = True
            existing_location.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(existing_location)
            return existing_location
        else:
            # Create new location
            new_location = Location(
                user_id=user_id,
                latitude=location_data.latitude,
                longitude=location_data.longitude,
                address=location_data.address,
                visibility=location_data.visibility,
                is_active=True
            )
            db.add(new_location)
            await db.commit()
            await db.refresh(new_location)
            return new_location

    @staticmethod
    async def update_location(
        db: AsyncSession,
        location_id: UUID,
        user_id: UUID,
        location_data: LocationUpdate
    ) -> Optional[Location]:
        """Update an existing location"""
        result = await db.execute(
            select(Location).where(
                and_(
                    Location.id == location_id,
                    Location.user_id == user_id
                )
            )
        )
        location = result.scalar_one_or_none()

        if not location:
            return None

        # Update fields if provided
        if location_data.latitude is not None:
            location.latitude = location_data.latitude
        if location_data.longitude is not None:
            location.longitude = location_data.longitude
        if location_data.address is not None:
            location.address = location_data.address
        if location_data.visibility is not None:
            location.visibility = location_data.visibility
        if location_data.is_active is not None:
            location.is_active = location_data.is_active

        location.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(location)
        return location

    @staticmethod
    async def get_my_location(db: AsyncSession, user_id: UUID) -> Optional[Location]:
        """Get the current user's location"""
        result = await db.execute(
            select(Location).where(Location.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_nearby_users(
        db: AsyncSession,
        user_id: UUID,
        max_distance_km: float = 5.0
    ) -> List[NearbyUserResponse]:
        """Get nearby users based on location"""
        # Get current user's location
        result = await db.execute(
            select(Location).where(
                and_(
                    Location.user_id == user_id,
                    Location.is_active == True
                )
            )
        )
        my_location = result.scalar_one_or_none()

        if not my_location:
            return []

        # Get all active locations except the current user's
        result = await db.execute(
            select(Location, User).join(
                User, Location.user_id == User.id
            ).where(
                and_(
                    Location.user_id != user_id,
                    Location.is_active == True,
                    User.is_active == True
                )
            )
        )
        locations_with_users = result.all()

        nearby_users = []
        for location, user in locations_with_users:
            # Calculate distance
            distance = LocationService.calculate_distance(
                my_location.latitude,
                my_location.longitude,
                location.latitude,
                location.longitude
            )

            # Filter by distance and visibility
            if distance <= max_distance_km:
                # Check visibility (for now, showing all. Can add friend logic later)
                if location.visibility == VisibilityLevel.PUBLIC or location.visibility == VisibilityLevel.FRIENDS:
                    nearby_users.append(
                        NearbyUserResponse(
                            user_id=user.id,
                            full_name=user.full_name,
                            year=user.year,
                            branch=user.branch,
                            latitude=location.latitude,
                            longitude=location.longitude,
                            address=location.address,
                            distance_km=round(distance, 2),
                            updated_at=location.updated_at
                        )
                    )

        # Sort by distance
        nearby_users.sort(key=lambda x: x.distance_km)
        return nearby_users

    @staticmethod
    async def delete_location(db: AsyncSession, user_id: UUID) -> bool:
        """Delete user's location (or set inactive)"""
        result = await db.execute(
            select(Location).where(Location.user_id == user_id)
        )
        location = result.scalar_one_or_none()

        if not location:
            return False

        # Set inactive instead of deleting
        location.is_active = False
        location.updated_at = datetime.utcnow()
        await db.commit()
        return True

    @staticmethod
    async def toggle_location_sharing(
        db: AsyncSession,
        user_id: UUID,
        is_active: bool
    ) -> Optional[Location]:
        """Enable or disable location sharing"""
        result = await db.execute(
            select(Location).where(Location.user_id == user_id)
        )
        location = result.scalar_one_or_none()

        if not location:
            return None

        location.is_active = is_active
        location.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(location)
        return location
