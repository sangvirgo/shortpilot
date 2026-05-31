from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from database import Base


class Draft(Base):
    __tablename__ = "drafts"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"))
    hook = Column(String)
    caption = Column(Text)
    hashtags = Column(Text)  # JSON array string
    scheduled_at = Column(DateTime)
    status = Column(String, default="DRAFT")  # DRAFT, READY, MANUAL_REQUIRED, POSTED
    posted_url = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Metrics
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    follows_gained = Column(Integer, default=0)
    cta_type = Column(String)  # FOLLOW, SAVE, COMMENT
