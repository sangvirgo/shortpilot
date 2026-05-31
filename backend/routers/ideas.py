import json
from fastapi import APIRouter, HTTPException, Depends
from schemas.schemas import IdeaRequest, IdeaResponse, IdeaItem
from services.gemini_llm import chat_completion
from deps import get_api_keys

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


@router.post("/generate", response_model=IdeaResponse)
async def generate_content_ideas(req: IdeaRequest, keys: dict = Depends(get_api_keys)):
    system_prompt = (
        "Bạn là một chuyên gia TikTok content strategy tại Việt Nam. "
        "Bạn tạo nội dung viral dành cho người Việt, sử dụng tiếng Việt tự nhiên, gần gũi. "
        "Khi gợi ý stock video, ưu tiên tìm footage châu Á, Đông Nam Á, Trung Quốc, Hàn Quốc, Nhật Bản. "
        "KHÔNG dùng footage người da trắng phương Tây nếu có thể tránh. "
        "Luôn trả về JSON hợp lệ, không giải thích."
    )

    user_prompt = f"""Tạo chính xác 5 ý tưởng TikTok cho:
- Lĩnh vực: {req.niche}
- Đối tượng: {req.audience}
- Chủ đề: {req.topic}
- Mục tiêu: {req.goal}

Trả về mảng JSON 5 đối tượng. Mỗi đối tượng có các trường:
- "hook": Câu mở đầu thu hút trong 3 giây đầu (tiếng Việt, tối đa 20 từ)
- "short_script": Kịch bản video 30 giây (tiếng Việt, 2-3 câu)
- "visual_keywords": Mảng 5 từ khóa tìm stock video (tiếng Anh, ưu tiên nội dung châu Á)
- "caption_angle": Góc độ caption cảm xúc (tiếng Việt)
- "stock_search_keywords": Mảng 3 từ khóa tìm video stock (tiếng Anh, phải liên quan châu Á/Trung Quốc/Nhật/Hàn/Việt Nam)

QUAN TRỌNG cho visual_keywords và stock_search_keywords:
- Ưu tiên: "asian", "chinese", "korean", "japanese", "vietnamese", "east asia", "technology asia"
- Nếu nội dung về công nghệ: "asian tech", "chinese tech", "korean startup"
- Nếu nội dung về ẩm thực: "chinese street food", "asian cooking", "vietnamese food"
- Nếu nội dung về học tập: "asian student", "korean study", "japanese work"
- TUYỆT ĐỐI KHÔNG dùng từ khóa chung chung như "person", "man", "woman" mà phải kèm "asian"

Hooks phải gây tò mò, hợp xu hướng Việt Nam. Script phải cụ thể, thực tế.

Trả về JSON array, không markdown, không giải thích."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        response = await chat_completion(messages, temperature=0.9, max_tokens=8000, api_key=keys["gemini"])

        cleaned = response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(lines)

        raw_ideas = json.loads(cleaned)
        if isinstance(raw_ideas, dict) and "ideas" in raw_ideas:
            raw_ideas = raw_ideas["ideas"]

        ideas = []
        for item in raw_ideas:
            ideas.append(IdeaItem(
                hook=item.get("hook", ""),
                short_script=item.get("short_script", ""),
                visual_keywords=item.get("visual_keywords", []),
                caption_angle=item.get("caption_angle", ""),
                stock_search_keywords=item.get("stock_search_keywords", []),
            ))
        return IdeaResponse(ideas=ideas)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ideas: {str(e)}")
