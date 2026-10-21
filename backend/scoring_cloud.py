import os
import json
import httpx


GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a strict but fair interview evaluator.
Score the candidate's answer on a 1-5 integer scale across five dimensions:
- relevance: did the answer address the question?
- technical_depth: correct concepts, examples, tradeoffs
- structure: logical flow, clear sequencing
- clarity: concise, understandable language
- confidence: decisive, no excessive hedging

Also provide 2-3 strengths and 2-3 improvements, one short sentence each.

Return ONLY valid JSON with exactly this shape:
{
  "relevance": <1-5>,
  "technical_depth": <1-5>,
  "structure": <1-5>,
  "clarity": <1-5>,
  "confidence": <1-5>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}"""


async def score_via_groq(
    question: str,
    answer: str,
    role: str,
    level: str,
) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    user_prompt = (
        f"Role: {role}\n"
        f"Level: {level}\n"
        f"Question: {question}\n"
        f"Candidate answer: {answer}\n\n"
        "Return JSON only."
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GROQ_CHAT_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
            },
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Groq scoring error {response.status_code}: {response.text[:200]}"
        )

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    return json.loads(content)