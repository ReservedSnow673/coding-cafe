from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.auth_service import AuthService
from app.schemas.auth import OTPRequest, OTPVerify, UserRegister, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-otp", response_model=Dict)
async def request_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """
    Request OTP for email verification
    
    - Sends a 6-digit OTP to the provided email
    - OTP expires in 10 minutes
    - Returns whether user exists or needs to register
    """
    return await AuthService.request_otp(request.email, db)


@router.post("/verify-otp", response_model=Dict)
async def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    """
    Verify OTP code
    
    - If user exists: Returns JWT token
    - If new user: Returns verification token and requires registration
    """
    return await AuthService.verify_otp(request.email, request.otp_code, db)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    
    - Creates user account with provided information
    - Returns JWT token for immediate login
    """
    return await AuthService.register_user(user_data, db)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current authenticated user information
    
    - Requires valid JWT token
    - Returns complete user profile
    """
    user = AuthService.get_current_user(current_user["user_id"], db)
    return UserResponse.from_orm(user)


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Refresh access token
    
    - Requires valid JWT token
    - Returns new JWT token
    """
    from app.core.security import create_access_token
    user = AuthService.get_current_user(current_user["user_id"], db)
    
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return Token(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )
