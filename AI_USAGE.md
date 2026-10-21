# AI Usage

SpeakUp AI uses AI for three tasks: question generation, speech-to-text, and answer scoring. Different parts use different providers.

## Speech-to-Text

**Deployed (Vercel):** Groq API
- Model: `whisper-large-v3`
- Input: audio file (webm/m4a)
- Output: transcript text
- The API key is stored as a Vercel environment variable (`GROQ_API_KEY`) and is never exposed to the browser.

**Local fallback:** Hugging Face `transformers` with `openai/whisper-small`
- Runs entirely on the user's machine
- Requires FFmpeg for audio conversion
- Configured via `AI_MODE=local` in the backend

## Answer Scoring

**Deployed (Vercel):** Groq API
- Model: `openai/gpt-oss-120b`
- Input: question, transcript, role, level
- Output: JSON with 5 dimension scores, strengths, improvements
- Uses `response_format: json_object` for reliable parsing

**Local fallback:** Hugging Face `transformers` with `microsoft/Phi-3-mini-4k-instruct`
- Runs on CPU
- Configured via `AI_MODE=local` in the backend

## Question Generation

**Local backend:** Google Gemini via `google-genai` SDK
- Model: `gemini-2.0-flash`
- If the API key is missing or fails, the backend returns built-in fallback questions (5 per role/level).
- The deployed frontend uses the fallback questions directly.

## Development and Diagnosis

**DeepSeek** — used for code structure, debugging, and deployment research.
- All suggestions were tested by running the code, and adjusted where needed.

## Product principles

- Scores are coaching signals, not hiring decisions.
- Rubric criteria are visible in `docs/scoring-rubric-and-prompt-design.md`.
- Generated feedback is not presented as objective truth.
- Credentials and user data are never committed.
- Mockups from Stitch AI are design evidence only, not proof of features.