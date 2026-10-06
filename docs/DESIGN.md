# SpeakUp AI — Design Document

## 1. Overview

SpeakUp AI is a mock-interview practice tool. A user picks a role
(Frontend Developer or Data Analyst) and a level (Entry-level,
Mid-level, Senior), and the system generates five role- and
level-specific interview questions. The long-term goal is to add
voice capture and automated answer scoring against a rubric.

## 2. Goals

- Generate realistic, role-specific interview questions.
- Accept a level input and tune difficulty accordingly.
- Provide a clear rubric that a future scoring component can use.
- Keep the backend simple, local-first, and easy to run.

## 3. Non-Goals (for this iteration)

- Voice interview capture is **not implemented**.
- Automated answer scoring is **not implemented**.
- User accounts, persistence, and analytics are out of scope.
- The backend is **not deployed**; it runs locally only.

## 4. Architecture
┌────────────────────┐ HTTP ┌────────────────────┐
│ Next.js Frontend │ ───────────────► │ FastAPI Backend │
│ (localhost:3000) │ │ (localhost:8000) │
└────────────────────┘ └─────────┬──────────┘
│
│ Gemini API
▼
┌────────────────────┐
│ Google AI Studio │
└────────────────────┘

- **Frontend:** Next.js App Router starter in `frontend/`.
- **Backend:** FastAPI service in `backend/`.
- **LLM:** Google Gemini via `GEMINI_API_KEY` in `backend/.env`.
- **Deployment:** Frontend deploys to Vercel. Backend is local-only.

## 5. Backend Endpoints

### `GET /api/health`

Returns:

```json
{"status":"ok","service":"backend"}