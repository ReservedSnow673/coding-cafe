from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.building import Building
from app.models.location import Location
from app.schemas.building import BuildingCreate, BuildingUpdate
import math
import uuid


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points using Haversine formula.
    Returns distance in meters.
    """
    # Earth radius in meters
    R = 6371000
    
    # Convert to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance


def find_nearest_building(db: Session, latitude: float, longitude: float) -> Optional[Tuple[Building, float]]:
    """
    Find the nearest building to given coordinates.
    Returns tuple of (Building, distance_in_meters) or None if no buildings exist.
    """
    buildings = db.query(Building).all()
    
    if not buildings:
        return None
    
    nearest_building = None
    min_distance = float('inf')
    
    for building in buildings:
        distance = calculate_distance(latitude, longitude, building.latitude, building.longitude)
        if distance < min_distance:
            min_distance = distance
            nearest_building = building
    
    return (nearest_building, min_distance) if nearest_building else None


def get_buildings_in_radius(db: Session, latitude: float, longitude: float, radius_meters: float = 500) -> List[Tuple[Building, float]]:
    """
    Get all buildings within a given radius of coordinates.
    Returns list of tuples (Building, distance_in_meters) sorted by distance.
    """
    buildings = db.query(Building).all()
    
    buildings_in_radius = []
    for building in buildings:
        distance = calculate_distance(latitude, longitude, building.latitude, building.longitude)
        if distance <= radius_meters:
            buildings_in_radius.append((building, distance))
    
    # Sort by distance
    buildings_in_radius.sort(key=lambda x: x[1])
    return buildings_in_radius


def create_building(db: Session, building: BuildingCreate) -> Building:
    """Create a new building."""
    db_building = Building(
        id=uuid.uuid4(),
        **building.dict()
    )
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building


def get_building(db: Session, building_id: uuid.UUID) -> Optional[Building]:
    """Get building by ID."""
    return db.query(Building).filter(Building.id == building_id).first()


def get_buildings(db: Session, skip: int = 0, limit: int = 100) -> List[Building]:
    """Get all buildings with pagination."""
    return db.query(Building).offset(skip).limit(limit).all()


def update_building(db: Session, building_id: uuid.UUID, building_update: BuildingUpdate) -> Optional[Building]:
    """Update a building."""
    db_building = get_building(db, building_id)
    if not db_building:
        return None
    
    update_data = building_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_building, field, value)
    
    db.commit()
    db.refresh(db_building)
    return db_building


def delete_building(db: Session, building_id: uuid.UUID) -> bool:
    """Delete a building."""
    db_building = get_building(db, building_id)
    if not db_building:
        return False
    
    db.delete(db_building)
    db.commit()
    return True


def auto_assign_building_to_location(db: Session, location_id: uuid.UUID, max_distance_meters: float = 200) -> Optional[Building]:
    """
    Automatically assign nearest building to a location if within max_distance.
    Returns the assigned building or None if no building within range.
    """
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        return None
    
    result = find_nearest_building(db, float(location.latitude), float(location.longitude))
    if not result:
        return None
    
    nearest_building, distance = result
    
    # Only assign if within max distance (default 200m)
    if distance <= max_distance_meters:
        location.building_id = nearest_building.id
        db.commit()
        db.refresh(location)
        return nearest_building
    
    return None
