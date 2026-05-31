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
from services import pexels, pixabay, stock_extra
from database import get_db
from models.video import Video
from config import settings
from deps import get_api_keys

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.post("/search", response_model=StockSearchResponse)
async def search_stock_videos(req: StockSearchRequest, keys: dict = Depends(get_api_keys)):
    orientation = "portrait" if req.orientation == "vertical" else "landscape"
    provider = req.provider or "all"
    all_results = []

    # Expanded Asian-focused search
    if provider in ("pexels", "all"):
        try:
            r = await stock_extra.search_pexels_expanded(
                query=req.query, orientation=orientation,
                api_key=keys.get("pexels", ""),
            )
            all_results.extend(r)
        except Exception as e:
            if provider == "pexels":
                raise HTTPException(status_code=502, detail=f"Pexels error: {e}")

    if provider in ("pixabay", "all"):
        try:
            r = await stock_extra.search_pixabay_expanded(
                query=req.query, orientation=req.orientation,
                api_key=keys.get("pixabay", ""),
            )
            all_results.extend(r)
        except Exception as e:
            if provider == "pixabay":
                raise HTTPException(status_code=502, detail=f"Pixabay error: {e}")

    # Direct search for specific providers
    if provider == "pexels" and not all_results:
        try:
            r = await pexels.search_videos(
                query=req.query, orientation=orientation, api_key=keys.get("pexels", ""),
            )
            all_results.extend(r)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Pexels error: {e}")

    if provider == "pixabay" and not all_results:
        try:
            r = await pixabay.search_videos(
                query=req.query, orientation=req.orientation, api_key=keys.get("pixabay", ""),
            )
            all_results.extend(r)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Pixabay error: {e}")

    candidates = []
    seen = set()
    for r in all_results:
        url = r.get("download_url", "")
        if not url or url in seen:
            continue
        seen.add(url)
        candidates.append(StockVideoCandidate(
            thumbnail=r.get("thumbnail", ""),
            source_provider=r.get("source_provider", ""),
            source_url=r.get("source_url", ""),
            license_note=r.get("license_note", ""),
            download_url=url,
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
