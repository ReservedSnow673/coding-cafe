from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    year: Optional[int] = Field(None, ge=1, le=4)
    branch: Optional[str] = Field(None, max_length=100)
    hostel: Optional[str] = Field(None, max_length=100)
    profile_picture: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "year": 3,
                "branch": "Computer Science"
            }
        }
