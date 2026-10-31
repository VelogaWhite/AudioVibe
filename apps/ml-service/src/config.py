"""Configuration settings for the AudioVibe ML Recommendation Microservice."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Final

from dotenv import load_dotenv

# Search for .env at apps/ml-service/.env or root of repository
_CURRENT_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _CURRENT_DIR.parents[1]

# Try local ml-service .env first, then root .env
if (_CURRENT_DIR.parent / ".env").exists():
    load_dotenv(_CURRENT_DIR.parent / ".env")
elif (_PROJECT_ROOT / ".env").exists():
    load_dotenv(_PROJECT_ROOT / ".env")
else:
    load_dotenv()


class Settings:
    """Application settings and constants."""

    APP_NAME: Final[str] = "AudioVibe Recommendation Service"
    APP_VERSION: Final[str] = "2.0.0"

    # Server config
    HOST: Final[str] = os.getenv("ML_SERVICE_HOST", "0.0.0.0")
    PORT: Final[int] = int(os.getenv("ML_SERVICE_PORT", "8000"))

    # OpenRouter LLM config
    OPENROUTER_API_KEY: Final[str] = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: Final[str] = os.getenv("OPENROUTER_MODEL", "thudm/glm-5.3-flash")
    OPENROUTER_API_URL: Final[str] = os.getenv(
        "OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions"
    )
    OPENROUTER_TIMEOUT_SECONDS: Final[float] = float(
        os.getenv("OPENROUTER_TIMEOUT_SECONDS", "15.0")
    )

    # Dataset path
    DATA_PATH: Final[Path] = (
        Path(os.getenv("CLEANED_DATA_PATH"))
        if os.getenv("CLEANED_DATA_PATH")
        else _CURRENT_DIR.parent / "data" / "spotify_tracks_cleaned.csv"
    )

    # 7-Dimensional audio features specification
    AUDIO_FEATURES_7D: Final[list[str]] = [
        "danceability",
        "valence",
        "energy",
        "acousticness",
        "instrumentalness",
        "liveness",
        "speechiness",
    ]


settings = Settings()
