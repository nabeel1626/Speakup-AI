import json
import re
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


MODEL_ID = "microsoft/Phi-3-mini-4k-instruct"

print(f"Loading {MODEL_ID}... (first run downloads ~2.3GB)")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    dtype=torch.float32,
    device_map=None,
)
model.eval()
print("Scoring model ready.")


SYSTEM_PROMPT = """You are a strict but fair interview evaluator. You score technical interview answers on a 1-5 scale across five dimensions.

Return ONLY valid JSON. No prose, no markdown. Format:
{
  "relevance": <1-5>,
  "technical_depth": <1-5>,
  "structure": <1-5>,
  "clarity": <1-5>,
  "confidence": <1-5>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}"""


def _build_prompt(question: str, answer: str, role: str, level: str) -> str:
    return f"""<|system|>
{SYSTEM_PROMPT}<|end|>
<|user|>
Role: {role}
Level: {level}
Question: {question}
Candidate answer: {answer}

Score this answer. Return JSON only.<|end|>
<|assistant|>
"""


def _extract_json(text: str) -> dict:
    """Pull the first JSON object out of the model output."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    # Look for a JSON block
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    raise ValueError(f"Could not parse JSON from model output: {text[:200]}")


def score_answer(question: str, answer: str, role: str, level: str) -> dict:
    prompt = _build_prompt(question, answer, role, level)
    inputs = tokenizer(prompt, return_tensors="pt")

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=400,
            do_sample=False,
            temperature=None,
            top_p=None,
            pad_token_id=tokenizer.eos_token_id,
        )

    # Strip the prompt tokens
    generated = output_ids[0][inputs["input_ids"].shape[1]:]
    text = tokenizer.decode(generated, skip_special_tokens=True)

    scores = _extract_json(text)
    return scores