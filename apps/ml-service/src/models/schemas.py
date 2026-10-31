"""Pydantic schemas for request and response validation."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, model_validator


class AudioFeatures7D(BaseModel):
    """The 7-dimensional audio feature vector for similarity scoring."""

    danceability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Suitability for dancing, from 0.0 (least) to 1.0 (most).",
    )
    valence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Musical positiveness/happiness from 0.0 to 1.0.",
    )
    energy: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Intensity and activity from 0.0 to 1.0.",
    )
    acousticness: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence measure of acousticness from 0.0 to 1.0.",
    )
    instrumentalness: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Predicts whether a track contains no vocals from 0.0 to 1.0.",
    )
    liveness: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Audience presence / live performance score from 0.0 to 1.0.",
    )
    speechiness: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Presence of spoken words from 0.0 to 1.0.",
    )

    def to_list(self) -> list[float]:
        """Convert features to ordered float list."""
        return [
            self.danceability,
            self.valence,
            self.energy,
            self.acousticness,
            self.instrumentalness,
            self.liveness,
            self.speechiness,
        ]


class RecommendRequest(BaseModel):
    """Request payload for track recommendation."""

    prompt: Optional[str] = Field(
        default=None,
        description="Natural language prompt describing desired mood or vibe.",
    )
    preset_name: Optional[str] = Field(
        default=None,
        description="Predefined mood preset name (e.g., Chill, Workout, Focus).",
    )
    limit: int = Field(
        default=15,
        ge=1,
        le=50,
        description="Number of recommended tracks to return (default: 15).",
    )

    @model_validator(mode="after")
    def check_at_least_one_input(self) -> RecommendRequest:
        """Ensure either prompt or preset_name is provided."""
        has_prompt = bool(self.prompt and self.prompt.strip())
        has_preset = bool(self.preset_name and self.preset_name.strip())
        if not has_prompt and not has_preset:
            raise ValueError("Either 'prompt' or 'preset_name' must be provided.")
        return self


class RecommendedTrack(BaseModel):
    """Metadata and audio feature representation for a recommended track."""

    track_id: str
    title: str
    artist_name: str
    album_name: Optional[str] = None
    genre: Optional[str] = None
    popularity: int = 0
    similarity_score: float
    audio_features: AudioFeatures7D


class RecommendResponse(BaseModel):
    """Response payload containing recommendations and target vector."""

    target_vector: AudioFeatures7D
    total_candidates: int
    tracks: list[RecommendedTrack]
    query_type: str


class RefineRequest(BaseModel):
    """Request payload for refining existing recommendations."""

    instruction: str = Field(
        ...,
        min_length=1,
        description="Refinement prompt (e.g., 'Make it faster and more acoustic').",
    )
    current_track_ids: list[str] = Field(
        default_factory=list,
        description="List of existing track IDs to exclude from new results.",
    )
    current_vector: Optional[AudioFeatures7D] = Field(
        default=None,
        description="The previous target vector to adjust against.",
    )
    limit: int = Field(
        default=15,
        ge=1,
        le=50,
        description="Number of refined tracks to return (default: 15).",
    )


class RefineResponse(BaseModel):
    """Response payload containing refined recommendations and updated vector."""

    refined_vector: AudioFeatures7D
    tracks: list[RecommendedTrack]
    instruction: str


class HealthResponse(BaseModel):
    """Server health and operational status."""

    status: str = "ok"
    tracks_in_memory: int
    model_name: str
    version: str
    timestamp: str
