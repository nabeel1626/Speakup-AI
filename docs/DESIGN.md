# SpeakUp AI — Design Document

**Status:** Design phase
**Last updated:** 6 October 2025
**Related:** [MOCKUPS.md](MOCKUPS.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

---

## 1. Agreed MVP

A voice-based mock interview web app. The user selects a role and level, the AI
asks five questions by voice, the user answers by voice, each answer is
transcribed and scored against a five-dimension rubric, and a final report card
summarizes performance.

**Five core features:**
1. Role and level selection
2. AI voice question (text-to-speech)
3. Voice answer with transcription (speech-to-text)
4. Per-question rubric-based scoring and feedback
5. Final report card

---

## 2. Target users and roles

- **Users:** job-seeking fresh graduates and early-career technical candidates
- **Supported roles in MVP:** Frontend Developer, Data Analyst
- **Levels:** Entry-level, Mid-level, Senior

---

## 3. Screen inventory

| ID | Name | Purpose | Implemented? |
|---|---|---|---|
| S01 | Landing | Entry point; explain product; start button | No |
| S02 | Role and level selection | Choose role and level | No |
| S03 | Mic permission | Request and verify microphone access | No |
| S04 | Voice interview — question | Play AI question, record answer | No |
| S05 | Transcription review | Show transcript; allow re-record | No |
| S06 | Voice interview — next | Advance through five questions | No |
| S07 | Evaluation in progress | Loading state while scoring | No |
| S08 | Rubric feedback | Per-dimension scores, strengths, improvements | No |
| S09 | Adaptive follow-up | Optional deeper question on a weak dimension | No |
| S10 | Final report card | Overall score, per-dimension averages | No |
| S11 | Offline / error recovery | If API or mic fails | No |
| S12 | History | Past sessions | No |

---

## 4. Main user journeys

**Journey 1 — First interview:**
S01 → S02 → S03 → (S04 → S05 → S06) × 5 → S07 → S08 → S10

**Journey 2 — Retry after low score:**
S10 → S02 (retry same role) → S04 → ... → S10

**Journey 3 — Error recovery:**
Any screen → S11 → back to the failed screen

---

## 5. Architecture and data flow
[Next.js frontend on Vercel]
↓ /api/* (relative fetch)
[FastAPI backend — local only for now]
↓
[Google Gemini API — question generation]
[OpenAI Whisper — speech-to-text — planned]
[OpenAI TTS — text-to-speech — planned]
[Database — planned]

Current status:
- Frontend: Next.js starter deployed to Vercel (public URL not yet verified)
- Backend: local only, exposes `GET /api/health` and `POST /api/generate-questions`
- Question generation: Google Gemini with local fallback
- Voice capture, TTS, STT, scoring, and database: not implemented

---

## 6. Acceptance criteria

- [ ] User can select a role and level
- [ ] AI speaks five questions aloud
- [ ] User can record answers
- [ ] Answers are transcribed
- [ ] Each answer is scored on five dimensions
- [ ] Final report card is shown
- [ ] Public URL is deployed and verified in incognito
- [ ] Works on desktop and mobile Chrome

---

## 7. Feature status

**Implemented:**
- `GET /api/health`
- `POST /api/generate-questions` (Gemini + local fallback)
- Next.js starter page

**Planned:**
- Voice capture
- Text-to-speech question audio
- Speech-to-text transcription
- Per-question rubric scoring
- Final report card
- Session history
- Adaptive follow-ups

**Excluded from 28-day scope:**
- User accounts and login
- Video analysis
- Payment
- Multi-language support
- Resume parsing
- Real-time interruption handling