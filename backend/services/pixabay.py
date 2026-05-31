import httpx
from config import settings

PIXABAY_API_URL = "https://pixabay.com/api/videos/"

ASIAN_BOOST = ["asian", "chinese", "korean", "japanese", "vietnamese", "east asia"]
GENERIC_WORDS = {"person", "people", "man", "woman", "student", "worker", "cooking", "food", "city", "street", "technology", "coding", "office", "study", "shopping", "beauty", "fashion", "fitness"}


def _boost_query(query: str) -> str:
    q_lower = query.lower()
    if any(a in q_lower for a in ASIAN_BOOST):
        return query
    words = set(q_lower.split())
    if words & GENERIC_WORDS:
        return f"asian {query}"
    return query


async def search_videos(query: str, orientation: str = "vertical", per_page: int = 15, api_key: str | None = None) -> list:
    key = api_key or settings.PIXABAY_API_KEY
    boosted = _boost_query(query)
    params = {
        "key": key,
        "q": boosted,
        "per_page": per_page,
        "safesearch": "true",
        "video_type": "all",
    }
    if orientation == "vertical":
        params["min_width"] = 720
        params["min_height"] = 1280

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(PIXABAY_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

    results = []
    for hit in data.get("hits", []):
        videos = hit.get("videos", {})
        medium = videos.get("medium", {})
        small = videos.get("small", {})
        chosen = medium if medium.get("url") else small

        thumbnail = hit.get("picture_id", "")
        if thumbnail:
            thumbnail = f"https://i.vimeocdn.com/video/{thumbnail}_295x166.jpg"

        results.append({
            "thumbnail": thumbnail,
            "source_provider": "PIXABAY",
            "source_url": hit.get("pageURL", ""),
            "license_note": "Pixabay License (free for commercial use, no attribution required)",
            "download_url": chosen.get("url", ""),
            "duration": hit.get("duration"),
            "width": chosen.get("width"),
            "height": chosen.get("height"),
        })
    return results
