from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas.schemas import VideoOut
from database import get_db
from models.video import Video

router = APIRouter(prefix="/api/videos", tags=["videos"])


@router.get("", response_model=List[VideoOut])
def list_videos(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    niche: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(Video)
    if status:
        query = query.filter(Video.status == status)
    if niche:
        query = query.filter(Video.niche == niche)
    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    return videos


@router.get("/{video_id}", response_model=VideoOut)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Clean up files
    import os
    for path in [video.local_raw_path, video.local_rendered_path, video.thumbnail_path]:
        if path and os.path.exists(path):
            os.remove(path)

    db.delete(video)
    db.commit()
    return {"detail": "Video deleted", "id": video_id}
