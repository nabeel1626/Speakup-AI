import json
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

import main


class FakeCompletions:
    def __init__(self, content_responses: list[str]):
        self.content_responses = content_responses
        self.calls = []

    async def create(self, **kwargs):
        self.calls.append(kwargs)
        content = self.content_responses.pop(0)
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
        )


class FakeAsyncOpenAI:
    completions: FakeCompletions

    def __init__(self, **_kwargs):
        self.chat = SimpleNamespace(completions=self.completions)

    async def close(self):
        return None


def make_json_response(prefix: str = "Question") -> str:
    return json.dumps(
        {"questions": [f"{prefix} {index}: describe your approach?" for index in range(1, 6)]}
    )


def test_five_role_level_combinations_return_five_questions():
    cases = [
        ("Frontend Developer", "Entry-level"),
        ("Frontend Developer", "Mid-level"),
        ("Frontend Developer", "Senior"),
        ("Data Analyst", "Entry-level"),
        ("Data Analyst", "Senior"),
    ]

    with TestClient(main.app) as client:
        for role, level in cases:
            FakeAsyncOpenAI.completions = FakeCompletions([make_json_response()])
            with patch.object(main, "AsyncOpenAI", FakeAsyncOpenAI), patch.dict(
                "os.environ", {"OPENAI_API_KEY": "test-key"}
            ):
                response = client.post(
                    "/api/generate-questions",
                    json={"role": role, "level": level},
                )

            assert response.status_code == 200
            body = response.json()
            assert body["role"] == role
            assert body["level"] == level
            assert len(body["questions"]) == 5
            assert body["source"] == "model"
            call = FakeAsyncOpenAI.completions.calls[0]
            assert call["model"] == "gpt-4o-mini"
            assert call["response_format"] == {"type": "json_object"}
            assert role in call["messages"][0]["content"]
            assert level.lower() in call["messages"][0]["content"].lower()


def test_invalid_json_retries_then_returns_fallback():
    FakeAsyncOpenAI.completions = FakeCompletions(
        ["not json", json.dumps({"questions": ["Only one question?"]})]
    )

    with TestClient(main.app) as client, patch.object(
        main, "AsyncOpenAI", FakeAsyncOpenAI
    ), patch.dict("os.environ", {"OPENAI_API_KEY": "test-key"}):
        response = client.post(
            "/api/generate-questions",
            json={"role": "Data Analyst", "level": "Mid-level"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "fallback"
    assert len(body["questions"]) == 5
    assert len(FakeAsyncOpenAI.completions.calls) == 2
    assert "previous response was not valid" in FakeAsyncOpenAI.completions.calls[1][
        "messages"
    ][0]["content"]


def test_missing_api_key_returns_service_unavailable():
    with TestClient(main.app) as client, patch.dict("os.environ", {}, clear=True):
        response = client.post(
            "/api/generate-questions",
            json={"role": "Frontend Developer", "level": "Entry-level"},
        )

    assert response.status_code == 503


def test_unsupported_role_is_rejected():
    with TestClient(main.app) as client:
        response = client.post(
            "/api/generate-questions",
            json={"role": "Product Manager", "level": "Mid-level"},
        )

    assert response.status_code == 422