"""Common dependency functions for FastAPI routes"""

from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db as core_get_db
from app.core.security import get_current_user as core_get_current_user
from app.models.user import User


def get_db() -> Generator:
    """
    Database session dependency.
    
    Yields a database session and ensures it's closed after use.
    """
    return core_get_db()


async def get_current_user(user_data: dict = Depends(core_get_current_user), db: Session = Depends(get_db)) -> User:
    """
    Get current authenticated user.
    
    Args:
        user_data: User data from JWT token
        db: Database session
        
    Returns:
        User model instance
        
    Raises:
        HTTPException: If user not found or inactive
    """
    from uuid import UUID
    
    user = db.query(User).filter(User.id == UUID(user_data["user_id"])).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify current user is an admin.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User model instance (admin)
        
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user
