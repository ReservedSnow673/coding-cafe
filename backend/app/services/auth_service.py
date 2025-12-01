from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
import secrets
import uuid
import logging

from app.models.user import User
from app.models.otp import OTPRequest
from app.core.security import create_access_token, generate_otp
from app.schemas.auth import UserRegister, UserResponse, Token
from app.services.email_service import EmailService
from app.core.config import settings

logger = logging.getLogger(__name__)


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
        
        # Try to send OTP via email
        email_sent = False
        try:
            email_sent = EmailService.send_otp_email(email, otp_code)
        except Exception as e:
            logger.warning(f"Failed to send OTP email to {email}: {str(e)}")
        
        if not email_sent:
            logger.warning(f"Email not sent to {email}, but OTP stored in DB for SMTP bypass")
        
        # Return response based on environment
        response = {
            "message": "OTP sent to email" if email_sent else "OTP generated (SMTP Bypass Mode)",
            "user_exists": user is not None,
            "email_sent": email_sent
        }
        
        # In development mode or if email failed, include OTP in response (SMTP Bypass)
        if settings.ENVIRONMENT == "development" or settings.DEBUG or not email_sent:
            response["otp"] = otp_code
            response["bypass_mode"] = True
        
        return response
    
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
        
        # Send welcome email (async, don't block on failure)
        try:
            EmailService.send_welcome_email(new_user.email, new_user.full_name)
        except Exception as e:
            logger.warning(f"Failed to send welcome email to {new_user.email}: {str(e)}")
        
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
