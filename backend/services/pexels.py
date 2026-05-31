import httpx
from config import settings

PEXELS_VIDEO_SEARCH_URL = "https://api.pexels.com/videos/search"

# Auto-append Asian context keywords when query is generic
ASIAN_BOOST = ["asian", "chinese", "korean", "japanese", "vietnamese", "east asia"]
GENERIC_WORDS = {"person", "people", "man", "woman", "student", "worker", "cooking", "food", "city", "street", "technology", "coding", "office", "study", "shopping", "beauty", "fashion", "fitness"}


def _boost_query(query: str) -> str:
    """If query is generic, add Asian context to find better footage."""
    q_lower = query.lower()
    # Already has Asian context
    if any(a in q_lower for a in ASIAN_BOOST):
        return query
    # Check if query contains generic words
    words = set(q_lower.split())
    if words & GENERIC_WORDS:
        return f"asian {query}"
    return query


async def search_videos(query: str, orientation: str = "portrait", per_page: int = 15, api_key: str | None = None) -> list:
    key = api_key or settings.PEXELS_API_KEY
    boosted = _boost_query(query)
    headers = {"Authorization": key}
    params = {
        "query": boosted,
        "orientation": orientation,
        "per_page": per_page,
        "size": "medium",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(PEXELS_VIDEO_SEARCH_URL, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

    results = []
    for video in data.get("videos", []):
        video_files = video.get("video_files", [])
        best_file = None
        for vf in video_files:
            if vf.get("width", 0) <= 1080 and vf.get("height", 0) >= 1920:
                best_file = vf
                break
        if not best_file and video_files:
            best_file = min(video_files, key=lambda f: abs(f.get("width", 0) - 1080))

        picture = video.get("video_pictures", [{}])
        thumbnail = picture[0].get("picture", "") if picture else ""

        results.append({
            "thumbnail": thumbnail,
            "source_provider": "PEXELS",
            "source_url": video.get("url", ""),
            "license_note": "Pexels License (free for commercial use, no attribution required)",
            "download_url": best_file.get("link", "") if best_file else "",
            "duration": video.get("duration"),
            "width": best_file.get("width") if best_file else None,
            "height": best_file.get("height") if best_file else None,
        })
    return results
