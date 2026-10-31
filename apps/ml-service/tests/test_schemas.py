"""Unit tests for Pydantic request and response schemas."""

import pytest
from pydantic import ValidationError

from src.models.schemas import (
    AudioFeatures7D,
    HealthResponse,
    RecommendedTrack,
    RecommendRequest,
    RecommendResponse,
    RefineRequest,
    RefineResponse,
)


class TestAudioFeatures7D:
    """Test suite for AudioFeatures7D schema validation."""

    def test_valid_audio_features_boundaries(self) -> None:
        """Test AudioFeatures7D accepts boundary values (0.0 and 1.0)."""
        zeros = AudioFeatures7D(
            danceability=0.0,
            valence=0.0,
            energy=0.0,
            acousticness=0.0,
            instrumentalness=0.0,
            liveness=0.0,
            speechiness=0.0,
        )
        assert zeros.danceability == 0.0
        assert zeros.to_list() == [0.0] * 7

        ones = AudioFeatures7D(
            danceability=1.0,
            valence=1.0,
            energy=1.0,
            acousticness=1.0,
            instrumentalness=1.0,
            liveness=1.0,
            speechiness=1.0,
        )
        assert ones.energy == 1.0
        assert ones.to_list() == [1.0] * 7

    def test_audio_features_rejects_out_of_range(self) -> None:
        """Test AudioFeatures7D raises ValidationError when values are outside [0.0, 1.0]."""
        with pytest.raises(ValidationError):
            AudioFeatures7D(
                danceability=-0.1,
                valence=0.5,
                energy=0.5,
                acousticness=0.5,
                instrumentalness=0.5,
                liveness=0.5,
                speechiness=0.5,
            )

        with pytest.raises(ValidationError):
            AudioFeatures7D(
                danceability=0.5,
                valence=1.2,
                energy=0.5,
                acousticness=0.5,
                instrumentalness=0.5,
                liveness=0.5,
                speechiness=0.5,
            )

    def test_to_list_preserves_feature_order(self) -> None:
        """Test to_list returns exact 7 elements in standard order."""
        features = AudioFeatures7D(
            danceability=0.1,
            valence=0.2,
            energy=0.3,
            acousticness=0.4,
            instrumentalness=0.5,
            liveness=0.6,
            speechiness=0.7,
        )
        assert features.to_list() == [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]


class TestRecommendRequest:
    """Test suite for RecommendRequest schema validation."""

    def test_valid_with_prompt_only(self) -> None:
        """Test valid RecommendRequest with prompt."""
        req = RecommendRequest(prompt="chill acoustic guitar morning")
        assert req.prompt == "chill acoustic guitar morning"
        assert req.preset_name is None
        assert req.limit == 15

    def test_valid_with_preset_only(self) -> None:
        """Test valid RecommendRequest with preset_name."""
        req = RecommendRequest(preset_name="chill")
        assert req.preset_name == "chill"
        assert req.prompt is None
        assert req.limit == 15

    def test_valid_with_both_prompt_and_preset(self) -> None:
        """Test valid RecommendRequest with both prompt and preset."""
        req = RecommendRequest(prompt="party vibes", preset_name="party", limit=20)
        assert req.prompt == "party vibes"
        assert req.preset_name == "party"
        assert req.limit == 20

    def test_rejects_missing_both_inputs(self) -> None:
        """Test validation error when both prompt and preset_name are missing."""
        with pytest.raises(ValidationError, match="Either 'prompt' or 'preset_name' must be provided"):
            RecommendRequest()

    def test_rejects_empty_whitespace_inputs(self) -> None:
        """Test validation error when both prompt and preset_name are empty strings."""
        with pytest.raises(ValidationError, match="Either 'prompt' or 'preset_name' must be provided"):
            RecommendRequest(prompt="   ", preset_name="   ")

    def test_limit_validation(self) -> None:
        """Test limit boundaries (1 to 50)."""
        with pytest.raises(ValidationError):
            RecommendRequest(prompt="rock", limit=0)

        with pytest.raises(ValidationError):
            RecommendRequest(prompt="rock", limit=51)

        req_min = RecommendRequest(prompt="rock", limit=1)
        assert req_min.limit == 1

        req_max = RecommendRequest(prompt="rock", limit=50)
        assert req_max.limit == 50


class TestRecommendedTrack:
    """Test suite for RecommendedTrack and RecommendResponse."""

    def test_recommended_track_creation(self) -> None:
        """Test RecommendedTrack instantiation with all fields."""
        features = AudioFeatures7D(
            danceability=0.8,
            valence=0.7,
            energy=0.9,
            acousticness=0.1,
            instrumentalness=0.0,
            liveness=0.2,
            speechiness=0.05,
        )
        track = RecommendedTrack(
            track_id="sp_12345",
            title="Sunny Day",
            artist_name="Joyful Band",
            album_name="Summer Vibes",
            genre="Pop",
            popularity=80,
            similarity_score=0.9852,
            audio_features=features,
        )
        assert track.track_id == "sp_12345"
        assert track.album_name == "Summer Vibes"
        assert track.similarity_score == 0.9852

    def test_recommended_track_optional_fields(self) -> None:
        """Test RecommendedTrack with optional fields omitted or None."""
        features = AudioFeatures7D(
            danceability=0.5,
            valence=0.5,
            energy=0.5,
            acousticness=0.5,
            instrumentalness=0.5,
            liveness=0.5,
            speechiness=0.5,
        )
        track = RecommendedTrack(
            track_id="sp_67890",
            title="Unknown Track",
            artist_name="Unknown Artist",
            similarity_score=0.8,
            audio_features=features,
        )
        assert track.album_name is None
        assert track.genre is None
        assert track.popularity == 0


class TestRefineSchemas:
    """Test suite for RefineRequest and RefineResponse."""

    def test_valid_refine_request(self) -> None:
        """Test valid RefineRequest with all parameters."""
        current_vec = AudioFeatures7D(
            danceability=0.6,
            valence=0.5,
            energy=0.6,
            acousticness=0.3,
            instrumentalness=0.1,
            liveness=0.15,
            speechiness=0.05,
        )
        req = RefineRequest(
            instruction="Make it much more acoustic and calm",
            current_track_ids=["track_1", "track_2"],
            current_vector=current_vec,
            limit=10,
        )
        assert req.instruction == "Make it much more acoustic and calm"
        assert len(req.current_track_ids) == 2
        assert req.current_vector is not None
        assert req.limit == 10

    def test_refine_request_defaults(self) -> None:
        """Test RefineRequest default field values."""
        req = RefineRequest(instruction="Faster tempo")
        assert req.current_track_ids == []
        assert req.current_vector is None
        assert req.limit == 15

    def test_refine_request_rejects_empty_instruction(self) -> None:
        """Test RefineRequest rejects empty string instruction."""
        with pytest.raises(ValidationError):
            RefineRequest(instruction="")


class TestHealthResponse:
    """Test suite for HealthResponse schema."""

    def test_valid_health_response(self) -> None:
        """Test HealthResponse creation."""
        health = HealthResponse(
            status="ok",
            tracks_in_memory=15000,
            model_name="thudm/glm-5.3-flash",
            version="2.0.0",
            timestamp="2026-10-31T09:00:00Z",
        )
        assert health.status == "ok"
        assert health.tracks_in_memory == 15000
