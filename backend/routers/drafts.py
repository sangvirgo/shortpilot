from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas.schemas import DraftCreate, DraftUpdate, DraftOut
from database import get_db
from models.draft import Draft
from models.video import Video

router = APIRouter(prefix="/api/drafts", tags=["drafts"])


@router.post("", response_model=DraftOut)
def create_draft(req: DraftCreate, db: Session = Depends(get_db)):
    # Verify video exists
    video = db.query(Video).filter(Video.id == req.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    draft = Draft(
        video_id=req.video_id,
        hook=req.hook,
        caption=req.caption,
        hashtags=req.hashtags,
        scheduled_at=req.scheduled_at,
        status=req.status,
        notes=req.notes,
        cta_type=req.cta_type,
    )
    db.add(draft)

    # Update video status
    video.status = "DRAFTED"
    db.commit()
    db.refresh(draft)
    return draft


@router.get("", response_model=List[DraftOut])
def list_drafts(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(Draft)
    if status:
        query = query.filter(Draft.status == status)
    drafts = query.order_by(Draft.created_at.desc()).offset(skip).limit(limit).all()
    return drafts


@router.get("/{draft_id}", response_model=DraftOut)
def get_draft(draft_id: int, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.patch("/{draft_id}", response_model=DraftOut)
def update_draft(draft_id: int, req: DraftUpdate, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(draft, field, value)

    db.commit()
    db.refresh(draft)
    return draft


@router.delete("/{draft_id}")
def delete_draft(draft_id: int, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    db.delete(draft)
    db.commit()
    return {"detail": "Draft deleted", "id": draft_id}
