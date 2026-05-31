import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.schemas import PublisherPrepareRequest, PublisherPrepareResponse
from database import get_db
from models.draft import Draft
from models.video import Video

router = APIRouter(prefix="/api/publisher", tags=["publisher"])

TIKTOK_STUDIO_URL = "https://www.tiktok.com/creator#/upload?scene=creator_center"


@router.post("/prepare", response_model=PublisherPrepareResponse)
async def prepare_for_publishing(req: PublisherPrepareRequest, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == req.draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    video = db.query(Video).filter(Video.id == draft.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Associated video not found")

    # Build the caption text
    caption_parts = []
    if draft.hook:
        caption_parts.append(draft.hook)
    if draft.caption:
        caption_parts.append(draft.caption)

    # Add hashtags
    hashtags = []
    if draft.hashtags:
        try:
            parsed = json.loads(draft.hashtags)
            if isinstance(parsed, list):
                hashtags = [f"#{tag.lstrip('#')}" for tag in parsed]
        except (json.JSONDecodeError, TypeError):
            pass

    # Add CTA
    if draft.cta_type:
        cta_map = {
            "FOLLOW": "👉 Follow for more!",
            "SAVE": "💾 Save this for later!",
            "COMMENT": "💬 Comment your thoughts below!",
        }
        cta_text = cta_map.get(draft.cta_type, draft.cta_type)
        caption_parts.append(cta_text)

    caption_text = "\n\n".join(caption_parts)
    if hashtags:
        caption_text += "\n\n" + " ".join(hashtags)

    # Determine video download URL (use rendered if available, otherwise raw)
    video_path = video.local_rendered_path or video.local_raw_path
    if not video_path:
        raise HTTPException(status_code=400, detail="No video file available")

    # Update draft status
    draft.status = "READY"
    db.commit()

    return PublisherPrepareResponse(
        video_download_url=f"/storage/rendered/{video_path.split('/')[-1]}" if video.local_rendered_path else f"/storage/raw/{video_path.split('/')[-1]}",
        caption_text=caption_text,
        hashtags=hashtags,
        tiktok_studio_url=TIKTOK_STUDIO_URL,
    )
