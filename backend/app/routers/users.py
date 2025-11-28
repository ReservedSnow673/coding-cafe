from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.file_upload_service import FileUploadService

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    user = db.query(User).filter(User.id == UUID(current_user["user_id"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    user = db.query(User).filter(User.id == UUID(current_user["user_id"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Update fields
    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.phone_number is not None:
        user.phone_number = update_data.phone_number
    if update_data.year is not None:
        user.year = update_data.year
    if update_data.branch is not None:
        user.branch = update_data.branch
    if update_data.hostel is not None:
        user.hostel = update_data.hostel
    if update_data.bio is not None:
        user.bio = update_data.bio
    
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/profile-picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(..., description="Profile picture (JPG, PNG, GIF, WebP, max 5MB)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload or update profile picture"""
    user = db.query(User).filter(User.id == UUID(current_user["user_id"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Delete old profile picture if exists
    if user.profile_picture:
        FileUploadService.delete_file(user.profile_picture)
    
    # Save new profile picture
    file_path = await FileUploadService.save_profile_picture(file, current_user["user_id"])
    user.profile_picture = file_path
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/me/profile-picture", response_model=UserResponse)
async def delete_profile_picture(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete profile picture"""
    user = db.query(User).filter(User.id == UUID(current_user["user_id"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.profile_picture:
        FileUploadService.delete_file(user.profile_picture)
        user.profile_picture = None
        db.commit()
        db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Get any user's public profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
