"""Seed initial building data for Plaksha campus

This script populates the buildings table with campus buildings.
Run with: python -m scripts.seed_buildings
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.building import Building, BuildingType
import uuid


def seed_buildings():
    """Seed campus buildings with coordinates."""
    db = SessionLocal()
    
    try:
        # Check if buildings already exist
        existing_count = db.query(Building).count()
        if existing_count > 0:
            print(f"Buildings already exist ({existing_count} buildings). Skipping seed.")
            return
        
        buildings_data = [
            # Academic Buildings
            {
                "name": "Academic Block 1",
                "code": "AC1",
                "building_type": BuildingType.ACADEMIC,
                "latitude": 30.3533,  # Example coordinates - replace with actual
                "longitude": 76.3737,
                "description": "Main academic building with lecture halls and labs",
                "floor_count": "4",
                "capacity": "500"
            },
            {
                "name": "Academic Block 2",
                "code": "AC2",
                "building_type": BuildingType.ACADEMIC,
                "latitude": 30.3538,
                "longitude": 76.3742,
                "description": "Secondary academic building",
                "floor_count": "3",
                "capacity": "300"
            },
            
            # Hostels
            {
                "name": "Boys Hostel 1",
                "code": "BH1",
                "building_type": BuildingType.HOSTEL,
                "latitude": 30.3528,
                "longitude": 76.3745,
                "description": "Boys residential building",
                "floor_count": "4",
                "capacity": "200"
            },
            {
                "name": "Boys Hostel 2",
                "code": "BH2",
                "building_type": BuildingType.HOSTEL,
                "latitude": 30.3525,
                "longitude": 76.3748,
                "description": "Boys residential building",
                "floor_count": "4",
                "capacity": "200"
            },
            {
                "name": "Girls Hostel 1",
                "code": "GH1",
                "building_type": BuildingType.HOSTEL,
                "latitude": 30.3542,
                "longitude": 76.3732,
                "description": "Girls residential building",
                "floor_count": "4",
                "capacity": "200"
            },
            {
                "name": "Girls Hostel 2",
                "code": "GH2",
                "building_type": BuildingType.HOSTEL,
                "latitude": 30.3545,
                "longitude": 76.3735,
                "description": "Girls residential building",
                "floor_count": "4",
                "capacity": "200"
            },
            
            # Dining
            {
                "name": "Mess Hall",
                "code": "MESS",
                "building_type": BuildingType.DINING,
                "latitude": 30.3535,
                "longitude": 76.3740,
                "description": "Main dining facility",
                "floor_count": "2",
                "capacity": "800"
            },
            {
                "name": "Campus Cafeteria",
                "code": "CAF",
                "building_type": BuildingType.DINING,
                "latitude": 30.3530,
                "longitude": 76.3738,
                "description": "Coffee and snacks",
                "floor_count": "1",
                "capacity": "100"
            },
            
            # Library
            {
                "name": "Central Library",
                "code": "LIB",
                "building_type": BuildingType.LIBRARY,
                "latitude": 30.3537,
                "longitude": 76.3739,
                "description": "Main library with study spaces",
                "floor_count": "3",
                "capacity": "300"
            },
            
            # Sports
            {
                "name": "Sports Complex",
                "code": "SPORT",
                "building_type": BuildingType.SPORTS,
                "latitude": 30.3540,
                "longitude": 76.3750,
                "description": "Indoor sports facilities",
                "floor_count": "2",
                "capacity": "200"
            },
            {
                "name": "Gym",
                "code": "GYM",
                "building_type": BuildingType.SPORTS,
                "latitude": 30.3543,
                "longitude": 76.3752,
                "description": "Fitness center",
                "floor_count": "1",
                "capacity": "50"
            },
            
            # Administrative
            {
                "name": "Administration Block",
                "code": "ADMIN",
                "building_type": BuildingType.ADMINISTRATIVE,
                "latitude": 30.3534,
                "longitude": 76.3736,
                "description": "Administrative offices",
                "floor_count": "2",
                "capacity": "100"
            },
            
            # Recreational
            {
                "name": "Student Activity Center",
                "code": "SAC",
                "building_type": BuildingType.RECREATIONAL,
                "latitude": 30.3532,
                "longitude": 76.3743,
                "description": "Student clubs and activities",
                "floor_count": "2",
                "capacity": "150"
            },
            {
                "name": "Auditorium",
                "code": "AUD",
                "building_type": BuildingType.RECREATIONAL,
                "latitude": 30.3536,
                "longitude": 76.3741,
                "description": "Main auditorium for events",
                "floor_count": "2",
                "capacity": "500"
            },
        ]
        
        # Create building records
        for building_data in buildings_data:
            building = Building(
                id=uuid.uuid4(),
                **building_data
            )
            db.add(building)
        
        db.commit()
        print(f"Successfully seeded {len(buildings_data)} buildings!")
        
        # Print summary
        for building_type in BuildingType:
            count = db.query(Building).filter(Building.building_type == building_type).count()
            print(f"  {building_type.value}: {count}")
        
    except Exception as e:
        print(f"Error seeding buildings: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding campus buildings...")
    seed_buildings()
