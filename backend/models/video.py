from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    source_type = Column(String)  # PEXELS, PIXABAY, GEMINI, OWNED
    source_url = Column(String)
    license_note = Column(String)
    local_raw_path = Column(String)
    local_rendered_path = Column(String)
    niche = Column(String)
    topic = Column(String)
    status = Column(String, default="RAW")  # RAW, RENDERED, DRAFTED, POSTED
    created_at = Column(DateTime, default=datetime.utcnow)
    thumbnail_path = Column(String)
