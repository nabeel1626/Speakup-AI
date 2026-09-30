# AI Usage

SpeakUp AI uses AI to simulate interviewer dialogue, evaluate answers against a user-selected rubric, and produce actionable feedback.

## Product principles

- Treat scores as coaching signals, not hiring decisions.
- Make rubric criteria visible and customizable.
- Avoid presenting generated feedback as objective truth.
- Keep user responses and interview data private; do not commit credentials or secrets.
- Provide a clear path for users to correct or disregard inaccurate feedback.

## Development guidance

When adding model-powered features, document the model, prompt intent, input data, output format, failure handling, and any external services used. Add tests for parsing and scoring behavior, especially around incomplete, ambiguous, or adversarial responses.