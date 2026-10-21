import asyncio
import os
import tempfile

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import errors
from pydantic import BaseModel

from question_generation import (
    FALLBACK_QUESTIONS,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    generate_question_response,
)
from transcription import transcribe_audio_file
from transcription_cloud import transcribe_via_groq
from scoring import score_answer
from scoring_cloud import score_via_groq
from ai_mode import use_local

app = FastAPI(title="SpeakUp AI API", version="0.1.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- Health

@app.get("/api/health")
def health() -> dict[str, str]:
    mode = "local" if use_local() else "cloud"
    return {"status": "ok", "service": "backend", "ai_mode": mode}


# ---------------------------------------------------------------- Questions

@app.post("/api/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
) -> GenerateQuestionsResponse:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return GenerateQuestionsResponse(
            role=request.role,
            level=request.level,
            questions=FALLBACK_QUESTIONS[(request.role, request.level)],
            source="fallback",
        )

    client = genai.Client(api_key=api_key)
    try:
        return await generate_question_response(request, client)
    except errors.APIError:
        return GenerateQuestionsResponse(
            role=request.role,
            level=request.level,
            questions=FALLBACK_QUESTIONS[(request.role, request.level)],
            source="fallback",
        )
    finally:
        await client.aio.aclose()


# ---------------------------------------------------------------- Transcribe

class TranscribeRequest(BaseModel):
    blob_url: str


@app.post("/api/transcribe")
async def transcribe_audio(request: TranscribeRequest) -> dict[str, str]:
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(request.blob_url)
            response.raise_for_status()
            audio_bytes = response.content
    except Exception as exc:
        print(f"BLOB FETCH ERROR: {type(exc).__name__}: {exc!r}")
        raise HTTPException(
            status_code=502,
            detail="Could not fetch audio from blob URL.",
        )

    suffix = ".webm"
    lower_url = request.blob_url.lower()
    if lower_url.endswith(".m4a"):
        suffix = ".m4a"
    elif lower_url.endswith(".mp3"):
        suffix = ".mp3"
    elif lower_url.endswith(".wav"):
        suffix = ".wav"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        if use_local():
            transcript = await asyncio.to_thread(transcribe_audio_file, tmp_path)
        else:
            transcript = await transcribe_via_groq(tmp_path, content_type="audio/webm")
        return {"transcript": transcript}
    except Exception as exc:
        print(f"TRANSCRIBE ERROR: {type(exc).__name__}: {exc!r}")
        raise HTTPException(
            status_code=502,
            detail="Transcription provider could not complete the request.",
        )
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


# ---------------------------------------------------------------- Scoring

class ScoreAnswerRequest(BaseModel):
    question: str
    answer: str
    role: str
    level: str


@app.post("/api/score-answer")
async def score_answer_endpoint(request: ScoreAnswerRequest) -> dict:
    try:
        if use_local():
            return await asyncio.to_thread(
                score_answer,
                request.question,
                request.answer,
                request.role,
                request.level,
            )
        else:
            return await score_via_groq(
                question=request.question,
                answer=request.answer,
                role=request.role,
                level=request.level,
            )
    except Exception as exc:
        print(f"SCORING ERROR: {type(exc).__name__}: {exc!r}")
        raise HTTPException(
            status_code=502,
            detail="Scoring failed.",
        )