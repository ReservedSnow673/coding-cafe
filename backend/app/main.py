from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="PlakshaConnect API",
    description="Campus networking and collaboration platform for Plaksha University",
    version="0.1.0",
)

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
from app.routers import auth, location, chat

app.include_router(auth.router, prefix="/api")
app.include_router(location.router, prefix="/api")
app.include_router(chat.router)
