import json
from services.gemini_llm import chat_completion


async def generate_ideas(niche: str, audience: str, topic: str, goal: str) -> list[dict]:
    system_prompt = (
        "You are a TikTok content strategist specializing in viral short-form video content. "
        "You generate creative, engaging content ideas optimized for TikTok's algorithm. "
        "Always respond with valid JSON only, no extra text."
    )

    user_prompt = f"""Generate exactly 20 TikTok content ideas for:
- Niche: {niche}
- Target Audience: {audience}
- Topic: {topic}
- Goal: {goal}

Return a JSON array of 20 objects. Each object must have these exact fields:
- "hook": A compelling first-3-seconds hook (string, max 15 words)
- "short_script": A brief 30-second video script outline (string, 2-3 sentences)
- "visual_keywords": Array of 5 keywords for finding stock footage (array of strings)
- "caption_angle": The emotional angle for the caption (string)
- "stock_search_keywords": Array of 3 keywords optimized for stock video search (array of strings)

Make hooks attention-grabbing. Make scripts specific and actionable. 
Make visual keywords concrete and searchable. Vary the approaches across all 20 ideas.

Return ONLY the JSON array, no markdown, no explanation."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = await chat_completion(messages, temperature=0.9, max_tokens=8000)

    # Try to parse the response as JSON
    try:
        # Strip markdown code blocks if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first line (```json or ```) and last line (```)
            lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(lines)
        ideas = json.loads(cleaned)
        if isinstance(ideas, dict) and "ideas" in ideas:
            ideas = ideas["ideas"]
        return ideas
    except json.JSONDecodeError:
        raise ValueError(f"Failed to parse DeepSeek response as JSON: {response[:500]}")
