import os
import httpx


GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
GROQ_WHISPER_MODEL = "whisper-large-v3"


async def transcribe_via_groq(file_path: str, content_type: str = "audio/webm") -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    with open(file_path, "rb") as f:
        files = {"file": ("audio.webm", f, content_type)}
        data = {"model": GROQ_WHISPER_MODEL, "response_format": "json"}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                GROQ_TRANSCRIBE_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                files=files,
                data=data,
            )

    if response.status_code != 200:
        raise RuntimeError(
            f"Groq Whisper error {response.status_code}: {response.text[:200]}"
        )

    return response.json().get("text", "").strip()