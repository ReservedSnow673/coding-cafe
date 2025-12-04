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
    yield from core_get_db()


async def get_current_user(current_user: User = Depends(core_get_current_user)) -> User:
    """
    Get current authenticated user.
    
    Args:
        current_user: User object from core security
        
    Returns:
        User model instance
        
    Raises:
        HTTPException: If user not found or inactive
    """
    # core_get_current_user already returns a User object and checks if user exists
    # Just verify the user is active
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return current_user


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
