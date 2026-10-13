import os
import tempfile

from fastapi import FastAPI, HTTPException, UploadFile, File
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
from scoring import score_answer

app = FastAPI(title="SpeakUp AI API", version="0.1.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "backend"}


@app.post("/api/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
) -> GenerateQuestionsResponse:
    api_key = os.getenv("GEMINI_API_KEY")

    # No key configured → return fallback questions instead of 503.
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
        # Gemini failed → return fallback rather than 502.
        return GenerateQuestionsResponse(
            role=request.role,
            level=request.level,
            questions=FALLBACK_QUESTIONS[(request.role, request.level)],
            source="fallback",
        )
    finally:
        await client.aio.aclose()


@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)) -> dict[str, str]:
    suffix = ".webm"
    if audio.filename and "." in audio.filename:
        suffix = "." + audio.filename.rsplit(".", 1)[-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await audio.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        transcript = transcribe_audio_file(tmp_path)
        return {"transcript": transcript}
    except Exception as exc:
        print(f"LOCAL WHISPER ERROR: {type(exc).__name__}: {exc!r}")
        raise HTTPException(
            status_code=502,
            detail="Transcription provider could not complete the request.",
        )
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


class ScoreAnswerRequest(BaseModel):
    question: str
    answer: str
    role: str
    level: str


@app.post("/api/score-answer")
def score_answer_endpoint(request: ScoreAnswerRequest) -> dict:
    try:
        return score_answer(
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