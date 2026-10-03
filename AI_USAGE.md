# AI Usage

SpeakUp AI uses a language model to generate role-specific interview questions. Automated interview dialogue and answer scoring are not currently implemented.

## Question Generation

- **Provider and model:** Google Gemini Developer API through the official `google-genai` Python SDK, using `gemini-3.8-flash`.
- **Prompt intent:** Generate five relevant interview questions matched to the selected role and experience level.
- **Input sent to Google:** Role and level only; the endpoint does not send candidate answers or personal data.
- **Output format:** JSON matching a Pydantic schema for exactly five unique, non-empty questions. The API returns the role, level, questions, and whether they came from Gemini or local fallback templates.
- **Failure handling:** Invalid JSON or schema output is retried once. If the retry is also invalid, the API returns five built-in questions for that role and level. A missing `GEMINI_API_KEY` returns HTTP 503; Gemini API errors return HTTP 502.
- **Credential handling:** Configure `GEMINI_API_KEY` only in the backend environment. Never expose it to the browser or commit it to source control.
- **External service:** Requests are processed by Google's Gemini Developer API and are subject to Google's API terms and data policies.

## Product principles

- Treat scores as coaching signals, not hiring decisions.
- Make rubric criteria visible and customizable.
- Avoid presenting generated feedback as objective truth.
- Keep user responses and interview data private; do not commit credentials or secrets.
- Provide a clear path for users to correct or disregard inaccurate feedback.

## Development guidance

When adding model-powered features, document the model, prompt intent, input data, output format, failure handling, and any external services used. Add tests for parsing and scoring behavior, especially around incomplete, ambiguous, or adversarial responses.
