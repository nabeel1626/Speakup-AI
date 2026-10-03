import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIError, AsyncOpenAI

from question_generation import (
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    generate_question_response,
)

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
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Question generation is unavailable until OPENAI_API_KEY is configured.",
        )

    client = AsyncOpenAI(api_key=api_key)
    try:
        return await generate_question_response(request, client)
    except APIError as exc:
        raise HTTPException(
            status_code=502,
            detail="The question generation provider could not complete the request.",
        ) from exc
    finally:
        await client.close()
