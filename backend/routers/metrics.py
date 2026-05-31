from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from schemas.schemas import MetricsSummary, MetricsUpdate, DraftOut, BestPerforming
from database import get_db
from models.video import Video
from models.draft import Draft

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/summary", response_model=MetricsSummary)
def get_metrics_summary(db: Session = Depends(get_db)):
    total_videos = db.query(func.count(Video.id)).scalar() or 0
    total_drafts = db.query(func.count(Draft.id)).scalar() or 0
    total_posted = db.query(func.count(Draft.id)).filter(Draft.status == "POSTED").scalar() or 0

    total_views = db.query(func.sum(Draft.views)).scalar() or 0
    total_likes = db.query(func.sum(Draft.likes)).scalar() or 0
    total_comments = db.query(func.sum(Draft.comments_count)).scalar() or 0
    total_shares = db.query(func.sum(Draft.shares)).scalar() or 0
    total_follows = db.query(func.sum(Draft.follows_gained)).scalar() or 0

    # Calculate engagement rate: (likes + comments + shares) / views * 100
    engagement_rate = 0.0
    if total_views > 0:
        engagement_rate = round((total_likes + total_comments + total_shares) / total_views * 100, 2)

    return MetricsSummary(
        total_videos=total_videos,
        total_drafts=total_drafts,
        total_posted=total_posted,
        total_views=total_views,
        total_likes=total_likes,
        total_comments=total_comments,
        total_shares=total_shares,
        total_follows=total_follows,
        avg_engagement_rate=engagement_rate,
    )


@router.post("/{draft_id}", response_model=DraftOut)
def update_draft_metrics(draft_id: int, req: MetricsUpdate, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    if req.views is not None:
        draft.views = req.views
    if req.likes is not None:
        draft.likes = req.likes
    if req.comments_count is not None:
        draft.comments_count = req.comments_count
    if req.shares is not None:
        draft.shares = req.shares
    if req.follows_gained is not None:
        draft.follows_gained = req.follows_gained

    db.commit()
    db.refresh(draft)
    return draft


@router.get("/best", response_model=BestPerforming)
def get_best_performing(limit: int = 10, db: Session = Depends(get_db)):
    drafts = (
        db.query(Draft)
        .filter(Draft.status == "POSTED")
        .order_by(
            (Draft.views + Draft.likes * 2 + Draft.comments_count * 3 + Draft.shares * 4).desc()
        )
        .limit(limit)
        .all()
    )
    return BestPerforming(drafts=drafts)
