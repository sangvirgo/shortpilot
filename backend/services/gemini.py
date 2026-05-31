def generate_veo_prompt(niche: str, topic: str, visual_keywords: list[str]) -> dict:
    keywords_str = ", ".join(visual_keywords)
    prompt = (
        f"A high-quality vertical short-form video for TikTok about '{topic}' in the '{niche}' niche. "
        f"Visual elements: {keywords_str}. "
        f"Style: modern, vibrant, fast-paced with smooth transitions. "
        f"Aspect ratio: 9:16, duration: 15-30 seconds. "
        f"Lighting: bright and engaging. "
        f"Camera movement: dynamic but smooth. "
        f"Color grading: warm, saturated tones. "
        f"Text-friendly layout with space for captions at the bottom third."
    )
    negative_prompt = (
        "blurry, low quality, watermark, text overlay, dark, shaky camera, "
        "horizontal orientation, 16:9 aspect ratio, boring, static, "
        "low resolution, pixelated, distorted faces"
    )
    style_notes = (
        "Optimized for TikTok vertical format. "
        "Leave bottom 30% clear for text overlays and captions. "
        "Use dynamic transitions every 3-5 seconds to maintain viewer attention. "
        "Consider adding subtle zoom effects for engagement."
    )
    return {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "style_notes": style_notes,
    }
