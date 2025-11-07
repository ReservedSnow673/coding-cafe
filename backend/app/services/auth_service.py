from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
import secrets
import uuid

from app.models.user import User
from app.models.otp import OTPRequest
from app.core.security import create_access_token, generate_otp
from app.schemas.auth import UserRegister, UserResponse, Token


class AuthService:
    @staticmethod
    async def request_otp(email: str, db: Session) -> dict:
        """Request OTP for email verification"""
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        # Generate OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Store OTP request
        otp_request = OTPRequest(
            email=email,
            otp_code=otp_code,
            expires_at=expires_at
        )
        db.add(otp_request)
        db.commit()
        
        # TODO: Send OTP via email
        # For development, return OTP in response
        return {
            "message": "OTP sent to email",
            "otp": otp_code,  # Remove this in production
            "user_exists": user is not None
        }
    
    @staticmethod
    async def verify_otp(email: str, otp_code: str, db: Session) -> dict:
        """Verify OTP and return user info or prompt for registration"""
        # Find valid OTP
        otp_request = db.query(OTPRequest).filter(
            OTPRequest.email == email,
            OTPRequest.otp_code == otp_code,
            OTPRequest.is_verified == False,
            OTPRequest.expires_at > datetime.utcnow()
        ).first()
        
        if not otp_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Mark OTP as verified
        otp_request.is_verified = True
        db.commit()
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            # Existing user - return token
            access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
            return {
                "requires_registration": False,
                "token": Token(
                    access_token=access_token,
                    user=UserResponse.from_orm(user)
                )
            }
        else:
            # New user - return verification token for registration
            verification_token = secrets.token_urlsafe(32)
            return {
                "requires_registration": True,
                "verification_token": verification_token,
                "email": email
            }
    
    @staticmethod
    async def register_user(user_data: UserRegister, db: Session) -> Token:
        """Register a new user"""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create new user
        new_user = User(
            email=user_data.email,
            hashed_password=secrets.token_urlsafe(32),  # Temporary password
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            year=user_data.year,
            branch=user_data.branch,
            hostel=user_data.hostel,
            bio=user_data.bio,
            is_verified=True,
            is_active=True
        )
        
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration failed"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
        
        return Token(
            access_token=access_token,
            user=UserResponse.from_orm(new_user)
        )
    
    @staticmethod
    def get_current_user(user_id: str, db: Session) -> User:
        """Get current authenticated user"""
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
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
