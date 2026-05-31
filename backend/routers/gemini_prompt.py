from fastapi import APIRouter, HTTPException
from schemas.schemas import GeminiPromptRequest, GeminiPromptResponse
from services.gemini import generate_veo_prompt

router = APIRouter(prefix="/api/gemini-prompt", tags=["gemini-prompt"])


@router.post("/generate", response_model=GeminiPromptResponse)
async def generate_gemini_prompt(req: GeminiPromptRequest):
    try:
        result = generate_veo_prompt(
            niche=req.niche,
            topic=req.topic,
            visual_keywords=req.visual_keywords,
        )
        return GeminiPromptResponse(
            prompt=result["prompt"],
            negative_prompt=result.get("negative_prompt"),
            style_notes=result.get("style_notes"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate prompt: {str(e)}")
