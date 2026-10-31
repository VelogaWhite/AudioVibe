"""Integration tests for FastAPI REST endpoints (/health, /api/v1/recommend, /api/v1/refine)."""

import pytest
from fastapi.testclient import TestClient

from src.services.vector_store import VectorStore, vector_store


class TestHealthEndpoint:
    """Test suite for GET /health."""

    def test_health_check_returns_ok(self, client: TestClient) -> None:
        """Test GET /health returns 200 and expected metadata."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["tracks_in_memory"] == 4
        assert "model_name" in data
        assert "version" in data
        assert "timestamp" in data


class TestRecommendEndpoint:
    """Test suite for POST /api/v1/recommend."""

    def test_recommend_with_preset(self, client: TestClient) -> None:
        """Test recommendation with predefined preset_name."""
        response = client.post(
            "/api/v1/recommend",
            json={"preset_name": "chill", "limit": 2},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query_type"] == "preset"
        assert len(data["tracks"]) == 2
        assert "target_vector" in data
        assert "track_id" in data["tracks"][0]
        assert "similarity_score" in data["tracks"][0]

    def test_recommend_with_prompt(self, client: TestClient) -> None:
        """Test recommendation with natural language prompt."""
        response = client.post(
            "/api/v1/recommend",
            json={"prompt": "high energy party workout music", "limit": 3},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query_type"] == "prompt"
        assert len(data["tracks"]) <= 3
        assert data["tracks"][0]["track_id"] in ["track_1", "track_4"]

    def test_recommend_missing_both_inputs_returns_422(
        self, client: TestClient
    ) -> None:
        """Test recommendation without prompt or preset returns 422 Unprocessable Entity."""
        response = client.post("/api/v1/recommend", json={"limit": 5})
        assert response.status_code == 422

    def test_recommend_when_store_not_loaded_returns_503(
        self, client: TestClient
    ) -> None:
        """Test 503 Service Unavailable when vector store is uninitialized."""
        # Temporarily clear vector store
        original_df = vector_store.df
        original_norm = vector_store.normalized_matrix
        original_loaded = vector_store._is_loaded

        try:
            vector_store._is_loaded = False
            vector_store.df = vector_store.df.iloc[0:0]

            response = client.post(
                "/api/v1/recommend", json={"preset_name": "chill"}
            )
            assert response.status_code == 503
            assert "vector store is not ready" in response.json()["detail"].lower()
        finally:
            vector_store.df = original_df
            vector_store.normalized_matrix = original_norm
            vector_store._is_loaded = original_loaded


class TestRefineEndpoint:
    """Test suite for POST /api/v1/refine."""

    def test_refine_success(self, client: TestClient) -> None:
        """Test refinement with instruction and excluded track IDs."""
        payload = {
            "instruction": "Make it much more acoustic and calm",
            "current_track_ids": ["track_1"],
            "limit": 2,
        }
        response = client.post("/api/v1/refine", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["instruction"] == "Make it much more acoustic and calm"
        assert "refined_vector" in data
        assert len(data["tracks"]) <= 2
        # Ensure track_1 was excluded
        returned_ids = [t["track_id"] for t in data["tracks"]]
        assert "track_1" not in returned_ids

    def test_refine_empty_instruction_returns_422(
        self, client: TestClient
    ) -> None:
        """Test refinement with empty instruction returns 422."""
        response = client.post("/api/v1/refine", json={"instruction": ""})
        assert response.status_code == 422

    def test_refine_when_store_not_loaded_returns_503(
        self, client: TestClient
    ) -> None:
        """Test refinement when store is empty returns 503."""
        original_loaded = vector_store._is_loaded
        original_df = vector_store.df

        try:
            vector_store._is_loaded = False
            vector_store.df = vector_store.df.iloc[0:0]

            response = client.post(
                "/api/v1/refine", json={"instruction": "more chill"}
            )
            assert response.status_code == 503
        finally:
            vector_store._is_loaded = original_loaded
            vector_store.df = original_df
