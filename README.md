# SpeakUp AI

SpeakUp AI is an AI-powered voice mock interviewer. The user selects a role
and experience level, the AI asks five questions by voice, records the
spoken answers, transcribes them, and scores each answer against a
five-dimension rubric with instant feedback.

## Live Application

- **Deployed app:** [https://speakup-ai-oomc.vercel.app/interview](https://speakup-ai-oomc.vercel.app/interview)

The deployed version runs entirely on Vercel. It uses Next.js API routes
to call Groq for speech-to-text (Whisper) and answer scoring (GPT-OSS).

## What's Implemented

| Area | Status |
| --- | --- |
| Interview flow (setup → 5 questions → summary) | ✅ Working |
| Browser text-to-speech for reading questions | ✅ Working |
| Microphone recording | ✅ Working |
| Speech-to-text (deployed: Groq Whisper) | ✅ Working |
| Speech-to-text (local: HuggingFace Whisper) | ✅ Working |
| Answer scoring (deployed: Groq GPT-OSS) | ✅ Working |
| Answer scoring (local: Phi-3-mini) | ✅ Working |
| Role and level selection (2 roles × 3 levels) | ✅ Working |
| Per-question score card (5 dimensions + strengths + improvements) | ✅ Working |
| Final summary with per-dimension averages | ✅ Working |
| Session persistence / history | ❌ Not in scope |
| User accounts | ❌ Not in scope |

## Architecture

The project has **two AI backends**:

1. **Deployed (Vercel + Groq)** — no Python server required.
   - Frontend calls `/api/generate-questions`, `/api/transcribe`, and
     `/api/score-answer` in Next.js.
   - Next.js API routes call Groq's API.
   - Fast, free tier, no local models to download.

2. **Local (FastAPI + HuggingFace)** — for offline development.
   - FastAPI backend in `backend/` runs local Whisper and Phi-3.
   - Toggle with the `AI_MODE` environment variable:
     - `AI_MODE=local` → uses local models
     - `AI_MODE=cloud` → uses Groq

The deployed version does not use the Python backend. It exists as a
reference implementation and for offline demos.

## Project Links

- [GitHub repository](https://github.com/nabeel1626/Speakup-AI)
- [Design document](docs/DESIGN.md) — MVP scope, screens, journeys
- [Mockups](docs/MOCKUPS.md) — design evidence from Stitch AI
- [Design system](docs/DESIGN_SYSTEM.md) — colors, typography, spacing
- [Scoring rubric and prompt design](docs/scoring-rubric-and-prompt-design.md)
- [Corrections log](docs/CORRECTIONS.md) — transparency on early reporting
- [AI usage disclosure](AI_USAGE.md)

## Run Locally

You need:
- Node.js 18+ with npm
- Python 3.11+ (only if running the local backend)

### Frontend (required)

```powershell
cd frontend
npm.cmd install
npm.cmd run dev