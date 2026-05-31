import axios from 'axios';
import type {
  ContentIdea,
  StockVideo,
  Video,
  Draft,
  CaptionResult,
  MetricsSummary,
  GeminiPrompt,
} from '../types';
import { getHeaders } from '../store/apiKeys';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  Object.assign(config.headers, getHeaders());
  return config;
});

// ── Helpers ──────────────────────────────────────────
const normalizeVideo = (v: Record<string, unknown>): Video => ({
  ...v,
  thumbnail: (v.thumbnail as string) || (v.thumbnail_path as string) || '',
  url: v.local_rendered_path
    ? `/storage/rendered/${(v.local_rendered_path as string).split('/').pop()}`
    : v.local_raw_path
      ? `/storage/raw/${(v.local_raw_path as string).split('/').pop()}`
      : '',
  duration: (v.duration as number) || 0,
} as Video);

const normalizeDraft = (d: Record<string, unknown>): Draft => {
  const hashtags = d.hashtags;
  let parsedHashtags: string[] = [];
  if (typeof hashtags === 'string') {
    try { parsedHashtags = JSON.parse(hashtags); } catch { parsedHashtags = []; }
  } else if (Array.isArray(hashtags)) {
    parsedHashtags = hashtags;
  }
  return {
    ...d,
    hashtags: parsedHashtags,
    cta: (d.cta as string) || (d.cta_type as string) || '',
  } as Draft;
};

// ── Ideas ────────────────────────────────────────────
export const ideasApi = {
  generate: async (params: {
    niche: string; audience: string; topic: string; goal: string;
  }): Promise<ContentIdea[]> => {
    const { data } = await client.post('/ideas/generate', params);
    return data.ideas ?? data;
  },
};

// ── Stock ────────────────────────────────────────────
export const stockApi = {
  search: async (params: {
    keywords: string; provider?: string; orientation?: string; per_page?: number;
  }): Promise<StockVideo[]> => {
    const { data } = await client.post('/stock/search', {
      query: params.keywords,
      provider: params.provider || 'both',
      orientation: params.orientation || 'vertical',
    });
    return (data.results ?? data).map((v: Record<string, unknown>) => ({
      ...v,
      url: v.download_url,
      provider: v.source_provider,
      id: v.source_url || v.download_url,
      tags: [],
    }));
  },

  download: async (params: {
    url: string; title: string; provider: string;
    source_url?: string; license_note?: string; niche?: string; topic?: string;
  }) => {
    const { data } = await client.post('/stock/download', {
      download_url: params.url,
      title: params.title,
      source_provider: params.provider,
      source_url: params.source_url || '',
      license_note: params.license_note || '',
      niche: params.niche || '',
      topic: params.topic || '',
    });
    return data;
  },
};

// ── Videos ───────────────────────────────────────────
export const videosApi = {
  list: async (status?: string): Promise<Video[]> => {
    const { data } = await client.get('/videos');
    const videos = (Array.isArray(data) ? data : []).map(normalizeVideo);
    if (status) {
      return videos.filter((v: Video) => v.status?.toLowerCase() === status.toLowerCase());
    }
    return videos;
  },

  get: async (id: string | number): Promise<Video> => {
    const { data } = await client.get(`/videos/${id}`);
    return normalizeVideo(data);
  },

  delete: async (id: string | number): Promise<void> => {
    await client.delete(`/videos/${id}`);
  },
};

// ── Renderer ─────────────────────────────────────────
export const rendererApi = {
  render: async (params: {
    video_id: string | number; text_overlay?: string; trim_duration?: number;
  }): Promise<Video> => {
    const { data } = await client.post('/renderer/render', {
      video_id: Number(params.video_id),
      text_overlay: params.text_overlay,
      trim_duration: params.trim_duration,
    });
    return data;
  },
};

// ── Captions ─────────────────────────────────────────
export const captionsApi = {
  generate: async (params: {
    niche: string; audience: string; hook: string; script: string; video_description: string;
  }): Promise<CaptionResult> => {
    const { data } = await client.post('/captions/generate', params);
    return data;
  },
};

// ── Drafts ───────────────────────────────────────────
export const draftsApi = {
  list: async (): Promise<Draft[]> => {
    const { data } = await client.get('/drafts');
    return (Array.isArray(data) ? data : []).map(normalizeDraft);
  },

  get: async (id: string | number): Promise<Draft> => {
    const { data } = await client.get(`/drafts/${id}`);
    return normalizeDraft(data);
  },

  create: async (params: Record<string, unknown>): Promise<Draft> => {
    // Backend expects hashtags as JSON string
    let hashtags = params.hashtags;
    if (Array.isArray(hashtags)) {
      hashtags = JSON.stringify(hashtags);
    }
    const { data } = await client.post('/drafts', {
      ...params,
      video_id: Number(params.video_id),
      hashtags,
    });
    return normalizeDraft(data);
  },

  update: async (id: string | number, params: Record<string, unknown>): Promise<Draft> => {
    let hashtags = params.hashtags;
    if (Array.isArray(hashtags)) {
      hashtags = JSON.stringify(hashtags);
    }
    const { data } = await client.patch(`/drafts/${id}`, { ...params, hashtags });
    return normalizeDraft(data);
  },

  delete: async (id: string | number): Promise<void> => {
    await client.delete(`/drafts/${id}`);
  },
};

// ── Publisher ────────────────────────────────────────
export const publisherApi = {
  prepare: async (draft_id: string | number) => {
    const { data } = await client.post('/publisher/prepare', { draft_id: Number(draft_id) });
    return data;
  },

  markPosted: async (draft_id: string | number, params: { posted_at?: string; tiktok_url?: string }) => {
    const { data } = await client.post('/publisher/mark-posted', {
      draft_id: Number(draft_id),
      posted_url: params.tiktok_url || '',
    });
    return data;
  },
};

// ── Metrics ──────────────────────────────────────────
export const metricsApi = {
  summary: async (): Promise<MetricsSummary> => {
    const { data } = await client.get('/metrics/summary');
    return {
      ...data,
      follows_per_post: data.follows_per_post ?? [],
      best_hooks: data.best_hooks ?? [],
      best_topics: data.best_topics ?? [],
      best_providers: data.best_providers ?? [],
    };
  },
};

// ── Gemini Prompt ────────────────────────────────────
export const geminiPromptApi = {
  generate: async (params: {
    niche: string; topic: string; visual_keywords: string[];
  }): Promise<GeminiPrompt> => {
    const { data } = await client.post('/gemini-prompt/generate', params);
    return data;
  },
};

export default client;
