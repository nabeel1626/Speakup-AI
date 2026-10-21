import os


def use_local() -> bool:
    """Return True if AI should run locally, False if it should call Groq."""
    return os.getenv("AI_MODE", "local").lower() != "cloud"