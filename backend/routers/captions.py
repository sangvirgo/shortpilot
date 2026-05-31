import json
from fastapi import APIRouter, HTTPException, Depends
from schemas.schemas import CaptionRequest, CaptionResponse, CaptionItem
from services.gemini_llm import chat_completion
from deps import get_api_keys

router = APIRouter(prefix="/api/captions", tags=["captions"])


@router.post("/generate", response_model=CaptionResponse)
async def generate_captions(req: CaptionRequest, keys: dict = Depends(get_api_keys)):
    system_prompt = (
        "Bạn là một copywriter TikTok chuyên tạo caption viral cho thị trường Việt Nam. "
        "Viết caption bằng tiếng Việt tự nhiên, gần gũi, có emoji. "
        "Hashtag ưu tiên tiếng Việt và trending Việt Nam. "
        "Luôn trả về JSON hợp lệ, không giải thích."
    )

    user_prompt = f"""Tạo 5 phương án caption TikTok cho video:
- Lĩnh vực: {req.niche}
- Đối tượng: {req.audience}
- Hook: {req.hook}
- Kịch bản: {req.script}
- Mô tả video: {req.video_description}

Trả về mảng JSON 5 đối tượng. Mỗi đối tượng có:
- "caption": Caption hấp dẫn (tiếng Việt, 2-3 dòng, có emoji tự nhiên, dùng xuống dòng)
- "hashtags": Mảng đúng 10 hashtag (tiếng Việt + tiếng Anh, không có dấu #, ví dụ: "tiktokvietnam", "haylà", "xuhuong2026")
- "cta": Call-to-action (tiếng Việt, ví dụ: "Theo dõi để xem thêm", "Lưu lại nhé", "Bình luận trải nghiệm của bạn", "Chia sẻ cho bạn bè cần")

Phong cách đa dạng: hài hước, truyền cảm hứng, giáo dục, gây tranh cãi, đồng cảm.
Caption phải hook-driven, cảm xúc, hợp xu hướng TikTok Việt Nam 2026.

Trả về JSON array, không markdown, không giải thích."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        response = await chat_completion(messages, temperature=0.9, max_tokens=4096, api_key=keys["gemini"])

        cleaned = response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(lines)

        raw_captions = json.loads(cleaned)
        if isinstance(raw_captions, dict) and "captions" in raw_captions:
            raw_captions = raw_captions["captions"]

        captions = []
        for item in raw_captions:
            captions.append(CaptionItem(
                caption=item.get("caption", ""),
                hashtags=item.get("hashtags", []),
                cta=item.get("cta", ""),
            ))
        return CaptionResponse(captions=captions)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption generation failed: {str(e)}")
