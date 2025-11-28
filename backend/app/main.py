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
    description="Campus networking and collaboration platform for Plaksha University",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
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
    """Root endpoint - API status check"""
    return {
        "message": "PlakshaConnect API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "PlakshaConnect API"
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
