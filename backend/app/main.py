from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path

from app.core.config import settings
from app.middleware import error_handler_middleware, validation_exception_handler

# Initialize FastAPI application
app = FastAPI(
    title="PlakshaConnect API",
    description="""
## PlakshaConnect - Campus Social Platform API

A comprehensive campus networking and collaboration platform for Plaksha University students.

### Features

* 🔐 **Authentication**: Email-based OTP authentication with JWT tokens
* 📢 **Announcements**: Campus-wide announcements with priority and targeting
* 🎯 **Challenges**: Gamified challenges with points, leaderboards, and progress tracking
* 💬 **Chat**: Real-time group messaging and conversations
* 🐛 **Issue Tracking**: Report and track campus issues with categories and priorities
* 👥 **Teams**: Create and manage teams with member roles
* 🍽️ **Mess Reviews**: Rate and review mess food with ratings and comments
* 📍 **Location Sharing**: Share and discover nearby users on campus
* 🔔 **Notifications**: Real-time notification system for all activities

### Authentication

Most endpoints require JWT Bearer token authentication. 

1. Request OTP: `POST /api/auth/request-otp`
2. Verify OTP: `POST /api/auth/verify-otp`
3. Use the returned `access_token` in Authorization header: `Bearer <token>`

### Rate Limiting

API implements rate limiting for security. Contact admin if you need higher limits.

### Support

For issues or questions, contact: support@plaksha.edu.in
    """,
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    contact={
        "name": "PlakshaConnect Support",
        "email": "support@plaksha.edu.in",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.plakshaconnect.com",
            "description": "Production server"
        }
    ],
    tags_metadata=[
        {
            "name": "Health",
            "description": "Health check and API status endpoints"
        },
        {
            "name": "Authentication",
            "description": "User authentication and registration endpoints using OTP"
        },
        {
            "name": "Users",
            "description": "User profile management and user information"
        },
        {
            "name": "Announcements",
            "description": "Campus announcements with priority and targeting options"
        },
        {
            "name": "Challenges",
            "description": "Gamified challenges with points, leaderboards, and progress tracking"
        },
        {
            "name": "Chat",
            "description": "Group chat and messaging functionality"
        },
        {
            "name": "Issues",
            "description": "Campus issue reporting and tracking system"
        },
        {
            "name": "Teams",
            "description": "Team creation and management with member roles"
        },
        {
            "name": "Mess Reviews",
            "description": "Mess food ratings and reviews"
        },
        {
            "name": "Location",
            "description": "Location sharing and nearby user discovery"
        },
        {
            "name": "Notifications",
            "description": "Real-time notification system"
        }
    ]
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
app.middleware("http")(error_handler_middleware)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


# Health check endpoints
@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint - API status check
    
    Returns basic information about the API including version and documentation links.
    """
    return {
        "message": "PlakshaConnect API",
        "status": "running",
        "version": "2.0.0",
        "description": "Campus networking and collaboration platform for Plaksha University",
        "documentation": {
            "swagger": "/api/docs",
            "redoc": "/api/redoc",
            "openapi": "/api/openapi.json"
        },
        "features": [
            "Authentication",
            "Announcements",
            "Challenges",
            "Chat",
            "Issues",
            "Teams",
            "Mess Reviews",
            "Location Sharing",
            "Notifications"
        ]
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    
    Used by monitoring tools and load balancers to verify service availability.
    Returns a simple status indicating the service is healthy and operational.
    """
    return {
        "status": "healthy",
        "service": "PlakshaConnect API",
        "version": "2.0.0"
    }


# Import routers
from app.routers import (
    auth,
    users,
    location,
    building,
    notifications,
    chat,
    announcement,
    issue,
    team,
    mess_reviews,
    challenges
)

# Register API routers
routers = [
    (auth.router, {"prefix": "/api"}),
    (users.router, {}),
    (location.router, {"prefix": "/api"}),
    (building.router, {}),
    (notifications.router, {}),
    (chat.router, {}),
    (announcement.router, {}),
    (issue.router, {}),
    (team.router, {}),
    (mess_reviews.router, {}),
    (challenges.router, {}),
]

for router, config in routers:
    app.include_router(router, **config)
