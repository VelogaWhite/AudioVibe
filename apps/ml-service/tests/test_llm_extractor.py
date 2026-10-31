"""Unit tests for LLMExtractor with mock LLM responses and heuristic fallbacks."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from src.models.schemas import AudioFeatures7D
from src.services.llm_extractor import LLMExtractor, PRESET_VECTORS


class TestLLMExtractorParsing:
    """Test suite for LLMExtractor parsing, validation, and preset matching."""

    @pytest.fixture
    def extractor(self) -> LLMExtractor:
        return LLMExtractor()

    def test_preset_vectors_exist_and_bounded(self) -> None:
        """Verify all curated benchmark preset vectors have values within [0.0, 1.0]."""
        required_presets = ["chill", "party", "workout", "focus", "lofi", "sad", "happy", "sleep"]
        for preset in required_presets:
            assert preset in PRESET_VECTORS
            vec = PRESET_VECTORS[preset]
            for val in vec.to_list():
                assert 0.0 <= val <= 1.0

    def test_get_preset_vector_case_insensitive(self, extractor: LLMExtractor) -> None:
        """Test preset vector retrieval handles case and substrings."""
        assert extractor._get_preset_vector("chill") is not None
        assert extractor._get_preset_vector("CHILL") is not None
        assert extractor._get_preset_vector("Chill Vibes") is not None
        assert extractor._get_preset_vector("unknown_preset_xyz") is None

    def test_parse_and_validate_clean_json(self, extractor: LLMExtractor) -> None:
        """Test parsing valid clean JSON without wrappers."""
        raw = json.dumps(
            {
                "danceability": 0.8,
                "valence": 0.7,
                "energy": 0.9,
                "acousticness": 0.1,
                "instrumentalness": 0.0,
                "liveness": 0.2,
                "speechiness": 0.05,
            }
        )
        vec = extractor._parse_and_validate_json(raw)
        assert vec.danceability == 0.8
        assert vec.valence == 0.7
        assert vec.energy == 0.9

    def test_parse_and_validate_markdown_wrapped_json(
        self, extractor: LLMExtractor
    ) -> None:
        """Test parsing JSON wrapped in markdown code fence with surrounding chatter."""
        raw = """Here is your feature vector:
```json
{
    "danceability": 0.65,
    "valence": 0.55,
    "energy": 0.70,
    "acousticness": 0.20,
    "instrumentalness": 0.30,
    "liveness": 0.15,
    "speechiness": 0.04
}
```
Enjoy your music!"""
        vec = extractor._parse_and_validate_json(raw)
        assert vec.danceability == 0.65
        assert vec.energy == 0.70

    def test_parse_and_validate_clamps_out_of_range(
        self, extractor: LLMExtractor
    ) -> None:
        """Test that values > 1.0 are clamped to 1.0 and < 0.0 clamped to 0.0."""
        raw = json.dumps(
            {
                "danceability": 1.5,
                "valence": -0.3,
                "energy": 2.0,
                "acousticness": -1.0,
                "instrumentalness": 0.5,
                "liveness": 0.5,
                "speechiness": 0.5,
            }
        )
        vec = extractor._parse_and_validate_json(raw)
        assert vec.danceability == 1.0
        assert vec.valence == 0.0
        assert vec.energy == 1.0
        assert vec.acousticness == 0.0

    def test_heuristic_extract_various_keywords(self, extractor: LLMExtractor) -> None:
        """Test heuristic extractor produces appropriate vectors for keywords."""
        calm_vec = extractor._heuristic_extract("super calm and relaxing acoustic song")
        assert calm_vec.energy < 0.5
        assert calm_vec.acousticness > 0.5

        party_vec = extractor._heuristic_extract("high energy party rock dance")
        assert party_vec.energy > 0.7
        assert party_vec.danceability > 0.7


@pytest.mark.asyncio
class TestLLMExtractorAsync:
    """Async test suite for LLMExtractor network calls and mock LLM integration."""

    async def test_extract_vector_preset_direct_match(self) -> None:
        """When preset_name is provided without prompt, returns curated preset without API call."""
        extractor = LLMExtractor()
        vec = await extractor.extract_vector(preset_name="chill")
        assert vec == PRESET_VECTORS["chill"]

    async def test_extract_vector_fallback_when_no_api_key(self) -> None:
        """When OPENROUTER_API_KEY is unset or placeholder, falls back to heuristic extractor."""
        extractor = LLMExtractor()
        extractor.api_key = "your_openrouter_api_key_here"
        vec = await extractor.extract_vector(prompt="upbeat cheerful pop")
        assert isinstance(vec, AudioFeatures7D)
        assert vec.valence > 0.5

    async def test_extract_vector_mock_llm_success(self) -> None:
        """Test extract_vector with mocked OpenRouter API response."""
        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "danceability": 0.88,
                                "valence": 0.77,
                                "energy": 0.91,
                                "acousticness": 0.05,
                                "instrumentalness": 0.12,
                                "liveness": 0.22,
                                "speechiness": 0.06,
                            }
                        )
                    }
                }
            ]
        }

        mock_http_client = AsyncMock(spec=httpx.AsyncClient)
        mock_http_client.post = AsyncMock(return_value=mock_response)

        extractor = LLMExtractor(http_client=mock_http_client)
        extractor.api_key = "sk-or-v1-valid-test-key"

        vec = await extractor.extract_vector(prompt="fast cyberpunk synthwave")
        assert vec.danceability == 0.88
        assert vec.energy == 0.91
        assert mock_http_client.post.await_count == 1

    async def test_extract_vector_mock_llm_failure_falls_back_to_heuristic(
        self,
    ) -> None:
        """Test extract_vector falls back gracefully to heuristic if API call raises exception."""
        mock_http_client = AsyncMock(spec=httpx.AsyncClient)
        mock_http_client.post = AsyncMock(side_effect=httpx.ConnectError("Connection timed out"))

        extractor = LLMExtractor(http_client=mock_http_client)
        extractor.api_key = "sk-or-v1-valid-test-key"

        vec = await extractor.extract_vector(prompt="calm lo-fi study beat")
        assert isinstance(vec, AudioFeatures7D)
        # Verify heuristic kicked in
        assert vec.acousticness > 0.5

    async def test_refine_vector_mock_llm_success(self) -> None:
        """Test refine_vector with mocked OpenRouter response."""
        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "danceability": 0.70,
                                "valence": 0.60,
                                "energy": 0.85,
                                "acousticness": 0.10,
                                "instrumentalness": 0.40,
                                "liveness": 0.15,
                                "speechiness": 0.05,
                            }
                        )
                    }
                }
            ]
        }

        mock_http_client = AsyncMock(spec=httpx.AsyncClient)
        mock_http_client.post = AsyncMock(return_value=mock_response)

        extractor = LLMExtractor(http_client=mock_http_client)
        extractor.api_key = "sk-or-v1-valid-test-key"

        base = AudioFeatures7D(
            danceability=0.5,
            valence=0.5,
            energy=0.5,
            acousticness=0.5,
            instrumentalness=0.1,
            liveness=0.1,
            speechiness=0.05,
        )

        refined = await extractor.refine_vector("Make it faster and heavier", current_vector=base)
        assert refined.energy == 0.85
        assert refined.danceability == 0.70

    async def test_refine_vector_heuristic_fallback(self) -> None:
        """Test refine_vector heuristic blending when no API key."""
        extractor = LLMExtractor()
        extractor.api_key = "your_openrouter_api_key_here"

        base = AudioFeatures7D(
            danceability=0.8,
            valence=0.8,
            energy=0.8,
            acousticness=0.1,
            instrumentalness=0.0,
            liveness=0.15,
            speechiness=0.05,
        )

        refined = await extractor.refine_vector("Make it calmer and softer", current_vector=base)
        assert isinstance(refined, AudioFeatures7D)
        # Energy should have decreased from base 0.8
        assert refined.energy < base.energy
