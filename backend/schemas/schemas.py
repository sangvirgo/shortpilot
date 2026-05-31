from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ---------- Ideas ----------
class IdeaRequest(BaseModel):
    niche: str
    audience: str
    topic: str
    goal: str


class IdeaItem(BaseModel):
    hook: str
    short_script: str
    visual_keywords: List[str]
    caption_angle: str
    stock_search_keywords: List[str]


class IdeaResponse(BaseModel):
    ideas: List[IdeaItem]


# ---------- Stock ----------
class StockSearchRequest(BaseModel):
    query: str
    orientation: str = "vertical"
    provider: str = "both"  # pexels, pixabay, both


class StockVideoCandidate(BaseModel):
    thumbnail: str
    source_provider: str
    source_url: str
    license_note: str
    download_url: str
    duration: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


class StockSearchResponse(BaseModel):
    results: List[StockVideoCandidate]


class StockDownloadRequest(BaseModel):
    download_url: str
    source_provider: str
    source_url: str
    license_note: str
    title: Optional[str] = None
    niche: Optional[str] = None
    topic: Optional[str] = None


class StockDownloadResponse(BaseModel):
    video_id: int
    local_raw_path: str


# ---------- Gemini Prompt ----------
class GeminiPromptRequest(BaseModel):
    niche: str
    topic: str
    visual_keywords: List[str]


class GeminiPromptResponse(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    style_notes: Optional[str] = None


# ---------- Videos ----------
class VideoOut(BaseModel):
    id: int
    title: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    license_note: Optional[str] = None
    local_raw_path: Optional[str] = None
    local_rendered_path: Optional[str] = None
    niche: Optional[str] = None
    topic: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    thumbnail_path: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Renderer ----------
class RenderRequest(BaseModel):
    video_id: int
    text_overlay: Optional[str] = None
    trim_duration: Optional[int] = None  # seconds
    music_placeholder: Optional[str] = None


class RenderResponse(BaseModel):
    video_id: int
    rendered_path: str
    status: str


# ---------- Captions ----------
class CaptionRequest(BaseModel):
    niche: str
    audience: str
    hook: str
    script: str
    video_description: str


class CaptionItem(BaseModel):
    caption: str
    hashtags: List[str]
    cta: str


class CaptionResponse(BaseModel):
    captions: List[CaptionItem]


# ---------- Drafts ----------
class DraftCreate(BaseModel):
    video_id: int
    hook: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[str] = None  # JSON string
    scheduled_at: Optional[datetime] = None
    status: str = "DRAFT"
    notes: Optional[str] = None
    cta_type: Optional[str] = None


class DraftUpdate(BaseModel):
    hook: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    posted_url: Optional[str] = None
    notes: Optional[str] = None
    cta_type: Optional[str] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    comments_count: Optional[int] = None
    shares: Optional[int] = None
    follows_gained: Optional[int] = None


class DraftOut(BaseModel):
    id: int
    video_id: Optional[int] = None
    hook: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    posted_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    comments_count: Optional[int] = None
    shares: Optional[int] = None
    follows_gained: Optional[int] = None
    cta_type: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Publisher ----------
class PublisherPrepareRequest(BaseModel):
    draft_id: int


class PublisherPrepareResponse(BaseModel):
    video_download_url: str
    caption_text: str
    hashtags: List[str]
    tiktok_studio_url: str


# ---------- Metrics ----------
class MetricsUpdate(BaseModel):
    views: Optional[int] = None
    likes: Optional[int] = None
    comments_count: Optional[int] = None
    shares: Optional[int] = None
    follows_gained: Optional[int] = None


class MetricsSummary(BaseModel):
    total_videos: int
    total_drafts: int
    total_posted: int
    total_views: int
    total_likes: int
    total_comments: int
    total_shares: int
    total_follows: int
    avg_engagement_rate: float


class BestPerforming(BaseModel):
    drafts: List[DraftOut]
