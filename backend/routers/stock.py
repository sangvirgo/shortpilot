import os
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.schemas import (
    StockSearchRequest,
    StockSearchResponse,
    StockVideoCandidate,
    StockDownloadRequest,
    StockDownloadResponse,
)
from services import pexels, pixabay
from database import get_db
from models.video import Video
from config import settings
from deps import get_api_keys

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.post("/search", response_model=StockSearchResponse)
async def search_stock_videos(req: StockSearchRequest, keys: dict = Depends(get_api_keys)):
    orientation = "portrait" if req.orientation == "vertical" else "landscape"
    all_results = []

    try:
        if req.provider in ("pexels", "both"):
            pexels_results = await pexels.search_videos(
                query=req.query,
                orientation=orientation,
                api_key=keys["pexels"],
            )
            all_results.extend(pexels_results)
    except Exception as e:
        if req.provider == "pexels":
            raise HTTPException(status_code=502, detail=f"Pexels API error: {str(e)}")

    try:
        if req.provider in ("pixabay", "both"):
            pixabay_results = await pixabay.search_videos(
                query=req.query,
                orientation=req.orientation,
                api_key=keys["pixabay"],
            )
            all_results.extend(pixabay_results)
    except Exception as e:
        if req.provider == "pixabay":
            raise HTTPException(status_code=502, detail=f"Pixabay API error: {str(e)}")

    candidates = []
    for r in all_results:
        candidates.append(StockVideoCandidate(
            thumbnail=r.get("thumbnail", ""),
            source_provider=r.get("source_provider", ""),
            source_url=r.get("source_url", ""),
            license_note=r.get("license_note", ""),
            download_url=r.get("download_url", ""),
            duration=r.get("duration"),
            width=r.get("width"),
            height=r.get("height"),
        ))
    return StockSearchResponse(results=candidates)


@router.post("/download", response_model=StockDownloadResponse)
async def download_stock_video(req: StockDownloadRequest, db: Session = Depends(get_db)):
    if not req.download_url:
        raise HTTPException(status_code=400, detail="No download URL provided")

    filename = f"{uuid.uuid4().hex}.mp4"
    raw_dir = os.path.join(settings.STORAGE_PATH, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    local_path = os.path.join(raw_dir, filename)

    try:
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
            response = await client.get(req.download_url)
            response.raise_for_status()
            with open(local_path, "wb") as f:
                f.write(response.content)
    except Exception as e:
        if os.path.exists(local_path):
            os.remove(local_path)
        raise HTTPException(status_code=502, detail=f"Download failed: {str(e)}")

    video = Video(
        title=req.title or f"Stock video from {req.source_provider}",
        source_type=req.source_provider,
        source_url=req.source_url,
        license_note=req.license_note,
        local_raw_path=local_path,
        niche=req.niche,
        topic=req.topic,
        status="RAW",
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return StockDownloadResponse(video_id=video.id, local_raw_path=local_path)
