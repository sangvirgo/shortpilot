import httpx
from config import settings


DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"


async def chat_completion(messages: list, model: str = "deepseek-chat", temperature: float = 0.8, max_tokens: int = 4096) -> str:
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(DEEPSEEK_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
