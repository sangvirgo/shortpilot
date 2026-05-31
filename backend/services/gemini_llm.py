import httpx
import json
from config import settings

# Models in priority order
GEMINI_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-2.0-flash",
]

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


async def chat_completion(
    messages: list,
    temperature: float = 0.8,
    max_tokens: int = 4096,
    api_key: str | None = None,
) -> str:
    """Gemini API chat completion with model fallback."""
    key = api_key or settings.GEMINI_API_KEY
    if not key:
        raise ValueError("No Gemini API key provided")

    # Convert OpenAI-style messages to Gemini format
    system_instruction = None
    contents = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "system":
            system_instruction = content
        elif role == "assistant":
            contents.append({"role": "model", "parts": [{"text": content}]})
        else:
            contents.append({"role": "user", "parts": [{"text": content}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json",
        },
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    last_error = None
    for model in GEMINI_MODELS:
        url = f"{GEMINI_BASE}/{model}:generateContent?key={key}"
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                data = response.json()

                candidates = data.get("candidates", [])
                if not candidates:
                    raise ValueError(f"Gemini ({model}) returned no candidates: {json.dumps(data)[:300]}")

                parts = candidates[0].get("content", {}).get("parts", [])
                text = "".join(p.get("text", "") for p in parts)
                return text

        except httpx.HTTPStatusError as e:
            last_error = f"{model}: HTTP {e.response.status_code}"
            continue
        except Exception as e:
            last_error = f"{model}: {str(e)}"
            continue

    raise ValueError(f"All Gemini models failed. Last error: {last_error}")
