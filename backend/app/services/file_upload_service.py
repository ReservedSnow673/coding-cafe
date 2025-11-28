import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import io

# Configuration
UPLOAD_DIR = Path("uploads")
PROFILE_PICS_DIR = UPLOAD_DIR / "profile_pictures"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_DIMENSION = 1024  # pixels

# Ensure upload directories exist
PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)


class FileUploadService:
    """Service for handling file uploads"""
    
    @staticmethod
    def validate_image(file: UploadFile) -> None:
        """Validate uploaded image file"""
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Max size: {MAX_FILE_SIZE / (1024*1024)}MB"
            )
    
    @staticmethod
    def resize_image(image: Image.Image, max_dimension: int = MAX_IMAGE_DIMENSION) -> Image.Image:
        """Resize image maintaining aspect ratio"""
        width, height = image.size
        
        if width <= max_dimension and height <= max_dimension:
            return image
        
        # Calculate new dimensions
        if width > height:
            new_width = max_dimension
            new_height = int((height / width) * max_dimension)
        else:
            new_height = max_dimension
            new_width = int((width / height) * max_dimension)
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    @staticmethod
    async def save_profile_picture(file: UploadFile, user_id: str) -> str:
        """
        Save profile picture and return the file path
        
        Args:
            file: Uploaded file
            user_id: User ID for naming
            
        Returns:
            Relative file path (e.g., "uploads/profile_pictures/user_id_uuid.jpg")
        """
        # Validate file
        FileUploadService.validate_image(file)
        
        # Read file content
        contents = await file.read()
        
        try:
            # Open and process image
            image = Image.open(io.BytesIO(contents))
            
            # Convert RGBA to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                image = background
            
            # Resize image
            image = FileUploadService.resize_image(image)
            
            # Generate unique filename
            file_ext = Path(file.filename).suffix.lower()
            unique_filename = f"{user_id}_{uuid.uuid4().hex}{file_ext}"
            file_path = PROFILE_PICS_DIR / unique_filename
            
            # Save image
            image.save(file_path, quality=85, optimize=True)
            
            # Return relative path
            return str(file_path.relative_to(UPLOAD_DIR.parent))
        
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error processing image: {str(e)}"
            )
    
    @staticmethod
    def delete_file(file_path: str) -> None:
        """Delete a file if it exists"""
        try:
            full_path = Path(file_path)
            if full_path.exists() and full_path.is_file():
                full_path.unlink()
        except Exception:
            pass  # Silently fail - file might not exist
