import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from database import engine, Base
from models.video import Video
from models.draft import Draft
from routers import (
    ideas,
    stock,
    gemini_prompt,
    videos,
    renderer,
    captions,
    drafts,
    publisher,
    metrics,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and storage directories
    Base.metadata.create_all(bind=engine)
    for subdir in ["raw", "rendered", "thumbnails"]:
        os.makedirs(os.path.join(settings.STORAGE_PATH, subdir), exist_ok=True)
    yield


app = FastAPI(
    title="ShortPilot",
    description="TikTok short-video content factory backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for storage
storage_path = os.path.abspath(settings.STORAGE_PATH)
os.makedirs(storage_path, exist_ok=True)
app.mount("/storage", StaticFiles(directory=storage_path), name="storage")

# Include routers
app.include_router(ideas.router)
app.include_router(stock.router)
app.include_router(gemini_prompt.router)
app.include_router(videos.router)
app.include_router(renderer.router)
app.include_router(captions.router)
app.include_router(drafts.router)
app.include_router(publisher.router)
app.include_router(metrics.router)


@app.get("/")
def root():
    return {
        "app": "ShortPilot",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
