# 🎬 ShortPilot — TikTok Content Factory

A self-hosted tool for creating TikTok-ready short videos using stock footage, AI captions, and manual publishing workflow.

## Features

- **Content Idea Generator** — AI-powered ideas with hooks, scripts, and visual keywords
- **Stock Video Finder** — Search Pexels & Pixabay for legally usable vertical videos
- **Video Renderer** — FFmpeg-based 9:16 vertical video rendering with text overlays
- **Caption Generator** — DeepSeek AI creates captions, hashtags, and CTAs
- **Draft Manager** — Organize and schedule your TikTok posts
- **Manual Publisher** — One-click TikTok Studio upload preparation
- **Metrics Tracker** — Track views, likes, follows, and find your best content patterns

## Quick Start

### 1. Get API Keys

| Service | Key | Required |
|---------|-----|----------|
| [DeepSeek](https://platform.deepseek.com) | AI captions & ideas | ✅ |
| [Pexels](https://www.pexels.com/api/) | Stock videos | ✅ |
| [Pixabay](https://pixabay.com/api/docs/) | Stock videos | ✅ |
| [Gemini](https://aistudio.google.com) | Optional prompts | ❌ |

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run

```bash
docker compose up -d
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 4. View Logs

```bash
docker compose logs -f
```

## Workflow

```
1. Generate Ideas → Enter niche/topic → Get 20 content ideas
2. Find Stock Video → Search Pexels/Pixabay → Download HD vertical video
3. Render → Crop to 9:16, add text overlay → 1080x1920 MP4
4. Generate Caption → AI creates 5 captions + hashtags + CTAs
5. Create Draft → Select caption, set schedule
6. Prepare for TikTok → Opens TikTok Studio, copy caption
7. Post → Upload video manually on TikTok Studio
8. Track Metrics → Record views/likes/follows after posting
```

## Why Manual Publishing?

ShortPilot does **not** use TikTok's official API for auto-posting because:
- Requires developer app approval (weeks/months process)
- Limited to specific content categories
- Subject to TikTok's review and rate limits

Instead, ShortPilot prepares everything and opens TikTok Studio for you to post manually. This is faster, simpler, and avoids any ToS violations.

## Architecture

```
shortpilot/
├── backend/          # FastAPI + SQLAlchemy + FFmpeg
├── frontend/         # React + TypeScript + Vite + Tailwind
├── storage/          # Raw videos, rendered videos, thumbnails
├── docker-compose.yml
└── .env
```

## Forbidden Practices

- ❌ No TikTok scraping
- ❌ No Douyin/TikTok/YouTube video downloading
- ❌ No watermark removal
- ❌ No Selenium/cookie auto-posting
- ❌ No captcha bypass
- ❌ No proxy rotation
- ❌ No fake engagement
- ❌ No secrets committed to git

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, FFmpeg
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Database:** SQLite
- **AI:** DeepSeek API
- **Video Sources:** Pexels API, Pixabay API
- **Deployment:** Docker Compose

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## License

MIT — Personal use tool. Respect all content source licenses (Pexels, Pixabay).
