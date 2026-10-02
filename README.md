# SpeakUp AI

SpeakUp AI is an AI-powered voice interviewer for realistic, role-specific mock interviews. It scores answers against a customizable rubric and provides immediate feedback.

## Project structure

- `frontend/`: Next.js App Router application.
- `backend/`: FastAPI service.

## Local development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend health check: `http://localhost:3000/api/health`

### Backend

```powershell
cd backend
py -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend health check: `http://localhost:8000/api/health`

## Deployment

### Vercel

Project dashboard: [SpeakUp AI](https://vercel.com/sspeakup-ai/speakup-ai).

1. Import the repository in Vercel.
2. Set the project root directory to `frontend`.
3. Keep the detected Next.js build settings and deploy.
4. Verify `https://<your-vercel-domain>/api/health` returns `{ "status": "ok" }`.

### Render

1. Create a new Render Web Service from the repository.
2. Set the root directory to `backend`.
3. Use `pip install -r requirements.txt` as the build command.
4. Use `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command.
5. Set `FRONTEND_URL` to the deployed Vercel URL.
6. Verify `https://<your-render-domain>/api/health` returns `{ "status": "ok" }`.

Render's free service sleeps after inactivity, so the first request after a quiet period may take longer.
