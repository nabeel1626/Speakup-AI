import os
import tempfile
import httpx


HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_WHISPER_URL = (
    "https://api-inference.huggingface.co/models/openai/whisper-small"
)


async def transcribe_audio_file(file_path: str) -> str:
    """Send a local audio file to Hugging Face's hosted Whisper and return text."""
    if not HF_API_TOKEN:
        raise RuntimeError(
            "HF_API_TOKEN is not configured. "
            "Create one at https://huggingface.co/settings/tokens"
        )

    with open(file_path, "rb") as f:
        audio_bytes = f.read()

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            HF_WHISPER_URL,
            headers={
                "Authorization": f"Bearer {HF_API_TOKEN}",
                "Content-Type": "application/octet-stream",
            },
            content=audio_bytes,
        )

    if response.status_code == 503:
        # Model is warming up on HF's side — safe to retry
        raise RuntimeError(
            "Hugging Face model is loading. Try again in 20 seconds."
        )
    if response.status_code != 200:
        raise RuntimeError(
            f"HF Whisper error {response.status_code}: {response.text[:200]}"
        )

    data = response.json()
    if isinstance(data, dict) and "text" in data:
        return data["text"].strip()
    raise RuntimeError(f"Unexpected HF response: {str(data)[:200]}")