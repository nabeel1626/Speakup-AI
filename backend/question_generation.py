from typing import Literal

from openai import AsyncOpenAI
from pydantic import BaseModel, ConfigDict, Field, field_validator

Role = Literal["Frontend Developer", "Data Analyst"]
Level = Literal["Entry-level", "Mid-level", "Senior"]


class GenerateQuestionsRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    role: Role
    level: Level


class GeneratedQuestionSet(BaseModel):
    model_config = ConfigDict(extra="forbid")

    questions: list[str] = Field(min_length=5, max_length=5)

    @field_validator("questions")
    @classmethod
    def validate_questions(cls, questions: list[str]) -> list[str]:
        cleaned = [question.strip() for question in questions]
        if any(not question for question in cleaned):
            raise ValueError("Questions must not be blank.")
        if len({question.casefold() for question in cleaned}) != len(cleaned):
            raise ValueError("Questions must be unique.")
        return cleaned


class GenerateQuestionsResponse(BaseModel):
    role: Role
    level: Level
    questions: list[str] = Field(min_length=5, max_length=5)
    source: Literal["model", "fallback"]


PROMPT_TEMPLATES: dict[tuple[Role, Level], str] = {
    ("Frontend Developer", "Entry-level"): (
        "Create entry-level Frontend Developer interview questions. Focus on HTML, "
        "CSS, JavaScript fundamentals, accessible UI, and explaining a simple "
        "implementation. Keep each question appropriate for an early-career candidate."
    ),
    ("Frontend Developer", "Mid-level"): (
        "Create mid-level Frontend Developer interview questions. Focus on React, "
        "browser behavior, accessibility, performance diagnosis, testing, and "
        "implementation tradeoffs expected of an independent contributor."
    ),
    ("Frontend Developer", "Senior"): (
        "Create senior Frontend Developer interview questions. Focus on frontend "
        "architecture, performance strategy, accessibility standards, technical "
        "tradeoffs, and raising engineering quality across a team."
    ),
    ("Data Analyst", "Entry-level"): (
        "Create entry-level Data Analyst interview questions. Focus on SQL "
        "fundamentals, data quality, basic metrics, clear communication, and "
        "describing a straightforward analysis."
    ),
    ("Data Analyst", "Mid-level"): (
        "Create mid-level Data Analyst interview questions. Focus on SQL analysis, "
        "metric definitions, validation, experimental reasoning, and communicating "
        "actionable findings independently."
    ),
    ("Data Analyst", "Senior"): (
        "Create senior Data Analyst interview questions. Focus on analytical "
        "strategy, causal reasoning, metric governance, ambiguous business "
        "problems, and influencing decisions across teams."
    ),
}

FALLBACK_QUESTIONS: dict[tuple[Role, Level], list[str]] = {
    ("Frontend Developer", "Entry-level"): [
        "How do semantic HTML elements help make a page accessible?",
        "When would you use CSS Grid instead of Flexbox?",
        "How would you make a button respond to a user's click in JavaScript?",
        "What steps would you take to make a form usable on a phone?",
        "How would you check that a page looks correct in more than one browser?",
    ],
    ("Frontend Developer", "Mid-level"): [
        "How would you diagnose an interaction that feels slow in a React application?",
        "How do you decide where component state should live?",
        "How would you test an accessible form with loading and error states?",
        "When would code splitting improve a frontend application's performance?",
        "How would you investigate a layout that breaks at a particular viewport?",
    ],
    ("Frontend Developer", "Senior"): [
        "How would you set frontend architecture boundaries for a growing product?",
        "How would you prioritize performance work across a large application?",
        "How would you establish accessibility practices across several teams?",
        "How would you evaluate a migration from a legacy frontend platform?",
        "How would you help a team resolve disagreement about a frontend tradeoff?",
    ],
    ("Data Analyst", "Entry-level"): [
        "How would you use a SQL query to find duplicate customer records?",
        "What is the difference between an inner join and a left join?",
        "How would you explain the conversion rate for an online signup flow?",
        "What would you check before calculating an average from a dataset?",
        "How would you summarize a simple chart for a nontechnical teammate?",
    ],
    ("Data Analyst", "Mid-level"): [
        "How would you investigate a sudden week-over-week change in a key metric?",
        "How do you validate that a SQL join has not duplicated observations?",
        "How would you define a useful retention metric for a product team?",
        "How would you compare outcomes between two groups while checking assumptions?",
        "How would you communicate an analysis with meaningful uncertainty?",
    ],
    ("Data Analyst", "Senior"): [
        "How would you assess whether a campaign caused a change in conversion?",
        "How would you establish trusted metric definitions across an organization?",
        "How would you prioritize analysis when several teams have urgent questions?",
        "How would you guide a team away from a misleading but popular metric?",
        "How would you present conflicting evidence to leaders making a decision?",
    ],
}

STRICT_JSON_REMINDER = (
    "The previous response was not valid for the required format. Return only one "
    'JSON object with exactly five distinct, non-empty string values in the "questions" '
    "array. Do not include markdown, explanations, or additional keys."
)


async def generate_question_response(
    request: GenerateQuestionsRequest,
    client: AsyncOpenAI,
) -> GenerateQuestionsResponse:
    prompt = PROMPT_TEMPLATES[(request.role, request.level)]
    user_prompt = (
        f"Generate exactly five distinct interview questions for the role "
        f"{request.role} at the {request.level} level. Return a JSON object "
        '{"questions": ["question 1", "question 2", "question 3", '
        '"question 4", "question 5"]}. Do not include answers.'
    )

    for attempt in range(2):
        system_prompt = prompt
        if attempt:
            system_prompt = f"{prompt}\n\n{STRICT_JSON_REMINDER}"

        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content if completion.choices else None
        try:
            generated = GeneratedQuestionSet.model_validate_json(content or "")
        except ValueError:
            continue

        return GenerateQuestionsResponse(
            role=request.role,
            level=request.level,
            questions=generated.questions,
            source="model",
        )

    return GenerateQuestionsResponse(
        role=request.role,
        level=request.level,
        questions=FALLBACK_QUESTIONS[(request.role, request.level)],
        source="fallback",
    )