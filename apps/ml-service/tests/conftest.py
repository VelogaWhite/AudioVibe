"""Pytest fixtures for AudioVibe ML recommendation service tests."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from src.config import settings
from src.main import app
from src.models.schemas import AudioFeatures7D
from src.services.vector_store import VectorStore, vector_store


@pytest.fixture
def sample_tracks_df() -> pd.DataFrame:
    """Create a sample pandas DataFrame with known track features for deterministic testing."""
    return pd.DataFrame(
        [
            {
                "track_id": "track_1",
                "track_name": "High Energy Banger",
                "artist_name": "DJ Party",
                "album_name": "Dance Floor Vol 1",
                "genre": "Dance",
                "popularity": 85,
                "duration_ms": 180000,
                "danceability": 0.90,
                "valence": 0.85,
                "energy": 0.95,
                "acousticness": 0.05,
                "instrumentalness": 0.02,
                "liveness": 0.20,
                "speechiness": 0.06,
            },
            {
                "track_id": "track_2",
                "track_name": "Chill Lofi Morning",
                "artist_name": "Coffee Beat",
                "album_name": "Late Night Study",
                "genre": "Lo-Fi",
                "popularity": 70,
                "duration_ms": 145000,
                "danceability": 0.50,
                "valence": 0.45,
                "energy": 0.30,
                "acousticness": 0.80,
                "instrumentalness": 0.75,
                "liveness": 0.10,
                "speechiness": 0.04,
            },
            {
                "track_id": "track_3",
                "track_name": "Acoustic Ballad",
                "artist_name": "Guitarist",
                "album_name": "Unplugged Sessions",
                "genre": "Folk",
                "popularity": 60,
                "duration_ms": 210000,
                "danceability": 0.40,
                "valence": 0.30,
                "energy": 0.25,
                "acousticness": 0.90,
                "instrumentalness": 0.10,
                "liveness": 0.15,
                "speechiness": 0.03,
            },
            {
                "track_id": "track_4",
                "track_name": "Workout Synthwave",
                "artist_name": "Neon Runner",
                "album_name": "Cyber Speed",
                "genre": "Electronic",
                "popularity": 75,
                "duration_ms": 195000,
                "danceability": 0.75,
                "valence": 0.65,
                "energy": 0.90,
                "acousticness": 0.02,
                "instrumentalness": 0.60,
                "liveness": 0.18,
                "speechiness": 0.05,
            },
        ]
    )


@pytest.fixture
def test_vector_store(sample_tracks_df: pd.DataFrame) -> VectorStore:
    """Create a populated VectorStore for unit testing."""
    vs = VectorStore()
    vs.load_from_dataframe(sample_tracks_df)
    return vs


@pytest.fixture
def client(sample_tracks_df: pd.DataFrame) -> TestClient:
    """Create a TestClient with preloaded global vector_store."""
    # Ensure global vector store has data
    vector_store.load_from_dataframe(sample_tracks_df)
    return TestClient(app)
