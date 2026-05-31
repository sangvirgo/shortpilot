// Backend API response types

export interface ContentIdea {
  hook: string;
  short_script: string;
  visual_keywords: string[];
  caption_angle: string;
  stock_search_keywords: string[];
  // Frontend-added aliases
  goal?: string;
  niche?: string;
  script?: string;
  keywords?: string[];
}

export interface StockVideo {
  title: string;
  thumbnail: string;
  source_provider: string;
  source_url: string;
  license_note: string;
  download_url: string;
  width: number;
  height: number;
  duration: number;
  // Frontend-added aliases
  url?: string;
  provider?: string;
  id?: string;
  tags?: string[];
}

export interface Video {
  id: number;
  title: string;
  source_type: string;
  source_url: string;
  license_note: string;
  local_raw_path: string;
  local_rendered_path: string;
  niche: string;
  topic: string;
  status: 'RAW' | 'RENDERED' | 'DRAFTED' | 'POSTED';
  created_at: string;
  thumbnail_path: string;
  // Frontend-added aliases
  thumbnail?: string;
  duration?: number;
  url?: string;
}

export interface Draft {
  id: number;
  video_id: number;
  hook: string;
  caption: string;
  hashtags: string[];
  scheduled_at: string | null;
  status: 'DRAFT' | 'READY' | 'MANUAL_REQUIRED' | 'POSTED';
  posted_url: string;
  notes: string;
  created_at: string;
  views: number;
  likes: number;
  comments_count: number;
  shares: number;
  follows_gained: number;
  cta_type: string;
  video?: Video;
}

export interface GeminiPrompt {
  prompt: string;
  negative_prompt: string;
  aspect_ratio: string;
  duration: string;
  style: string;
}

export interface CaptionResult {
  captions: Array<{
    caption: string;
    hashtags: string[];
    cta: string;
  }>;
}

export interface MetricsSummary {
  total_videos: number;
  total_drafts: number;
  total_posted: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_follows: number;
  avg_engagement_rate: number;
  // Optional ranking data
  follows_per_post?: { date: string; follows: number }[];
  best_hooks?: Record<string, unknown>[];
  best_topics?: Record<string, unknown>[];
  best_providers?: Record<string, unknown>[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
