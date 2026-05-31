import os
import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.schemas import RenderRequest, RenderResponse
from database import get_db
from models.video import Video
from services.ffmpeg import render_vertical
from config import settings

router = APIRouter(prefix="/api/renderer", tags=["renderer"])


@router.post("/render", response_model=RenderResponse)
async def render_video(req: RenderRequest, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == req.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video.local_raw_path or not os.path.exists(video.local_raw_path):
        raise HTTPException(status_code=400, detail="Raw video file not found on disk")

    rendered_dir = os.path.join(settings.STORAGE_PATH, "rendered")
    thumbnail_dir = os.path.join(settings.STORAGE_PATH, "thumbnails")
    os.makedirs(rendered_dir, exist_ok=True)
    os.makedirs(thumbnail_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}.mp4"
    output_path = os.path.join(rendered_dir, filename)
    thumb_filename = f"{uuid.uuid4().hex}.jpg"
    thumb_path = os.path.join(thumbnail_dir, thumb_filename)

    try:
        await render_vertical(
            input_path=video.local_raw_path,
            output_path=output_path,
            text_overlay=req.text_overlay,
            trim_duration=req.trim_duration,
            music_placeholder=req.music_placeholder,
            thumbnail_path=thumb_path,
        )
    except Exception as e:
        if os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=500, detail=f"Render failed: {str(e)}")

    video.local_rendered_path = output_path
    video.thumbnail_path = thumb_path
    video.status = "RENDERED"
    db.commit()

    return RenderResponse(
        video_id=video.id,
        rendered_path=output_path,
        status="RENDERED",
    )
