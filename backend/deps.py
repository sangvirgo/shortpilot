from fastapi import Request
from config import settings


def get_api_keys(request: Request) -> dict:
    """Extract API keys from request headers, fallback to env vars."""
    return {
        "gemini": request.headers.get("X-Gemini-Key") or settings.GEMINI_API_KEY,
        "pexels": request.headers.get("X-Pexels-Key") or settings.PEXELS_API_KEY,
        "pixabay": request.headers.get("X-Pixabay-Key") or settings.PIXABAY_API_KEY,
        "deepseek": request.headers.get("X-Deepseek-Key") or settings.DEEPSEEK_API_KEY,
    }
