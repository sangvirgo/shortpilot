import httpx
import asyncio
from config import settings

# ── Asian keyword expansion ───────────────────────────
ASIAN_EXPANSIONS = {
    # Tech/Coding
    "coding": ["asian developer coding", "chinese tech office", "korean startup", "japanese programmer"],
    "programming": ["asian coder laptop", "chinese coding class", "korean developer workspace"],
    "technology": ["asian tech", "chinese technology", "korean electronics", "japanese innovation"],
    "laptop": ["asian student laptop", "chinese office work", "korean study desk"],
    "computer": ["asian gamer setup", "chinese tech lab", "japanese computer"],
    # Food
    "food": ["chinese street food", "korean bbq cooking", "japanese ramen", "vietnamese pho"],
    "cooking": ["asian cooking", "chinese chef", "korean kitchen", "japanese sushi making"],
    "restaurant": ["asian restaurant", "chinese restaurant kitchen", "korean food stall"],
    # Lifestyle
    "study": ["asian student study", "korean study desk", "japanese library", "chinese exam prep"],
    "work": ["asian office", "chinese startup", "korean coworking", "japanese corporate"],
    "exercise": ["asian fitness", "korean gym", "japanese yoga", "chinese tai chi"],
    "beauty": ["korean skincare", "japanese beauty", "chinese makeup", "asian aesthetic"],
    "fashion": ["korean fashion", "japanese street style", "chinese modern fashion"],
    # City/Travel
    "city": ["shanghai skyline", "tokyo neon", "seoul city", "vietnam city", "hong kong"],
    "street": ["chinese street market", "tokyo street", "seoul street", "vietnam street"],
    "traffic": ["asian traffic", "chinese city traffic", "tokyo crossing", "vietnam motorbike"],
    # People
    "student": ["asian student", "korean student", "chinese university", "japanese school"],
    "woman": ["asian woman", "korean woman", "chinese woman", "japanese woman"],
    "man": ["asian man", "korean man", "chinese man", "japanese man"],
    "couple": ["asian couple", "korean couple", "chinese couple"],
    "family": ["asian family", "chinese family dinner", "korean family"],
    # Nature
    "nature": ["asian nature", "chinese mountain", "japanese cherry blossom", "vietnam landscape"],
    "beach": ["asian beach", "bali beach", "thailand beach", "vietnam beach"],
    # Abstract/Mood
    "success": ["asian businessman", "chinese entrepreneur", "korean office success"],
    "happy": ["asian people happy", "korean celebration", "chinese festival"],
    "sad": ["asian emotional", "rainy tokyo", "lonely city night"],
    "motivation": ["asian motivational", "korean study motivation", "sunrise asian city"],
}

GENERIC_WORDS = set(ASIAN_EXPANSIONS.keys())


def expand_query(query: str) -> list[str]:
    """Expand a query into multiple Asian-focused search queries."""
    q_lower = query.lower().strip()
    words = set(q_lower.split())
    
    # Already Asian
    asian_terms = {"asian", "chinese", "korean", "japanese", "vietnamese", "thai", "bali", 
                   "shanghai", "beijing", "tokyo", "seoul", "hanoi", "hong kong", "taiwan",
                   "china", "japan", "korea", "vietnam", "dong nam a"}
    if any(a in q_lower for a in asian_terms):
        return [query]
    
    # Find matching expansions
    matches = words & GENERIC_WORDS
    if matches:
        queries = []
        for word in matches:
            queries.extend(ASIAN_EXPANSIONS[word][:2])  # top 2 expansions per word
        return queries[:4]  # max 4 queries
    
    # Generic fallback - just prepend "asian"
    return [f"asian {query}", f"{query} asia"]


async def search_pexels_expanded(query: str, orientation: str = "portrait", api_key: str = "", max_results: int = 20) -> list:
    """Search Pexels with expanded Asian queries."""
    from services.pexels import search_videos
    
    queries = expand_query(query)
    tasks = [search_videos(q, orientation, 8, api_key) for q in queries[:3]]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_videos = []
    seen_urls = set()
    for r in results:
        if isinstance(r, list):
            for v in r:
                url = v.get("source_url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    all_videos.append(v)
    return all_videos[:max_results]


async def search_pixabay_expanded(query: str, orientation: str = "vertical", api_key: str = "", max_results: int = 20) -> list:
    """Search Pixabay with expanded Asian queries."""
    from services.pixabay import search_videos
    
    queries = expand_query(query)
    tasks = [search_videos(q, orientation, 8, api_key) for q in queries[:3]]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_videos = []
    seen_urls = set()
    for r in results:
        if isinstance(r, list):
            for v in r:
                url = v.get("source_url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    all_videos.append(v)
    return all_videos[:max_results]
