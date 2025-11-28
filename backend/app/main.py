from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings

app = FastAPI(
    title="PlakshaConnect API",
    description="Campus networking and collaboration platform for Plaksha University",
    version="0.1.0",
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "PlakshaConnect API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Import and register routers
from app.routers import auth, users, location, building, notifications, chat, announcement, issue, team, mess_reviews, challenges

app.include_router(auth.router, prefix="/api")
app.include_router(users.router)
app.include_router(location.router, prefix="/api")
app.include_router(building.router)
app.include_router(notifications.router)
app.include_router(chat.router)
app.include_router(announcement.router)
app.include_router(issue.router)
app.include_router(team.router)
app.include_router(mess_reviews.router)
app.include_router(challenges.router)
