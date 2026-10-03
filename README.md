# SpeakUp AI

SpeakUp AI is a mock-interview practice project focused on role-specific interview preparation. The repository contains a Next.js frontend starter, a FastAPI health and question-generation API, and documented scoring-rubric and prompt designs. Voice interview capture and automated answer scoring are not implemented yet.

## Project Links

- [GitHub repository](https://github.com/nabeel1626/Speakup-AI)
- [Vercel project dashboard](https://vercel.com/sspeakup-ai/speakup-ai) for project settings and deployments
- [Scoring rubric and prompt design](docs/scoring-rubric-and-prompt-design.md)

The Vercel link opens the project dashboard, not the public application. Use the URL shown for a successful deployment to share the live frontend.

## Current Status

| Area | Current implementation |
| --- | --- |
| Frontend | Next.js App Router starter application in `frontend/`. |
| Backend | FastAPI service in `backend/`; exposes `GET /api/health` and `POST /api/generate-questions`. |
| Scoring | Role-specific rubric and prompt design are documented; answer scoring is not connected to the application. |

## Run Locally

Install Node.js with npm and Python before starting the services. Run each service in a separate PowerShell terminal.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --env-file .env
```

Set `GEMINI_API_KEY` in `backend/.env` before starting the server to enable question generation. Create the key in [Google AI Studio](https://aistudio.google.com/apikey), keep it private, and never commit it.

The backend health endpoint is [http://localhost:8000/api/health](http://localhost:8000/api/health) and returns:

```json
{"status":"ok","service":"backend"}
```

`POST /api/generate-questions` accepts a role (`Frontend Developer` or `Data Analyst`) and a level (`Entry-level`, `Mid-level`, or `Senior`), then returns five validated questions. If the model returns invalid JSON twice, the API returns five role- and level-specific fallback questions. The [Postman collection](backend/postman/SpeakUp%20AI%20Questions.postman_collection.json) contains five example requests.

## Deployment

### Vercel

The [Vercel project dashboard](https://vercel.com/sspeakup-ai/speakup-ai) manages the frontend deployment. The Vercel project root is `frontend/`; the public application URL is shown in the project's deployment details. The FastAPI backend is currently available for local development only and is not configured for deployment to Vercel. The deployed frontend cannot call this local-only API until a reachable backend is configured.

## Documentation

- [Next.js documentation](https://nextjs.org/docs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [Vercel deployment documentation](https://vercel.com/docs/deployments)
