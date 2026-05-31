import os
import subprocess
import asyncio
from config import settings


async def render_vertical(
    input_path: str,
    output_path: str,
    text_overlay: str | None = None,
    trim_duration: int | None = None,
    music_placeholder: str | None = None,
    thumbnail_path: str | None = None,
) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    filter_parts = []

    # Scale and crop to 1080x1920 (9:16 vertical)
    filter_parts.append(
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920"
    )

    # Add text overlay if specified
    if text_overlay:
        escaped = text_overlay.replace("'", "'\\''").replace(":", "\\:")
        filter_parts.append(
            f"drawtext=text='{escaped}'"
            f":fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
            f":fontsize=48:fontcolor=white:borderw=3:bordercolor=black"
            f":x=(w-text_w)/2:y=h-h/6"
        )

    filter_complex = ",".join(filter_parts)

    cmd = ["ffmpeg", "-y"]

    # Trim if needed
    if trim_duration:
        cmd.extend(["-t", str(trim_duration)])

    cmd.extend([
        "-i", input_path,
    ])

    # Add music track if specified (as silent placeholder for now)
    if music_placeholder:
        cmd.extend([
            "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
            "-shortest",
        ])

    cmd.extend([
        "-vf", filter_complex,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        output_path,
    ])

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    if proc.returncode != 0:
        error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
        raise RuntimeError(f"FFmpeg render failed: {error_msg}")

    # Generate thumbnail if requested
    if thumbnail_path:
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
        thumb_cmd = [
            "ffmpeg", "-y",
            "-i", output_path,
            "-ss", "00:00:01",
            "-vframes", "1",
            "-vf", "scale=480:854",
            thumbnail_path,
        ]
        thumb_proc = await asyncio.create_subprocess_exec(
            *thumb_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await thumb_proc.communicate()

    return output_path


async def extract_thumbnail(video_path: str, thumbnail_path: str, timestamp: str = "00:00:01") -> str:
    os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-ss", timestamp,
        "-vframes", "1",
        "-vf", "scale=480:854",
        thumbnail_path,
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"Thumbnail extraction failed: {stderr.decode()}")
    return thumbnail_path


async def get_video_info(video_path: str) -> dict:
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        video_path,
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {stderr.decode()}")
    import json
    return json.loads(stdout.decode())
