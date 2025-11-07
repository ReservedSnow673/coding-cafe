from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


class OTPRequest(BaseModel):
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@plaksha.edu.in"
            }
        }


class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@plaksha.edu.in",
                "otp_code": "123456"
            }
        }


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    year: Optional[int] = Field(None, ge=1, le=4)
    branch: Optional[str] = Field(None, max_length=100)
    hostel: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@plaksha.edu.in",
                "full_name": "John Doe",
                "phone_number": "+919876543210",
                "year": 2,
                "branch": "Computer Science",
                "hostel": "Hostel A",
                "bio": "Passionate about technology and innovation"
            }
        }


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    phone_number: Optional[str]
    role: str
    year: Optional[int]
    branch: Optional[str]
    hostel: Optional[str]
    profile_picture: Optional[str]
    bio: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
