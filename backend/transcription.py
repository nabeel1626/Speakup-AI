import subprocess
import tempfile
import os
import torch
from transformers import pipeline


transcriber = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-small",
    dtype=torch.float32,
    device=-1,
)


def transcribe_audio_file(file_path: str) -> str:
    """Convert input audio to WAV via FFmpeg, then transcribe with Whisper."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wav_tmp:
        wav_path = wav_tmp.name

    try:
        result = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", file_path,
                "-ar", "16000",
                "-ac", "1",
                "-c:a", "pcm_s16le",
                wav_path,
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg conversion failed: {result.stderr.strip()[-300:]}")

        output = transcriber(wav_path)
        return output["text"].strip()
    finally:
        try:
            os.remove(wav_path)
        except OSError:
            pass