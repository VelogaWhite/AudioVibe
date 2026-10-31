"""In-Memory Vector Matrix and fast Cosine Similarity store."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Sequence

import numpy as np
import pandas as pd

from src.config import settings
from src.models.schemas import AudioFeatures7D, RecommendedTrack

logger = logging.getLogger("vector_store")


class VectorStore:
    """Manages in-memory metadata and normalized 7D audio feature vectors."""

    def __init__(self) -> None:
        self.df: pd.DataFrame = pd.DataFrame()
        self.raw_matrix: np.ndarray = np.empty((0, 7), dtype=np.float32)
        self.normalized_matrix: np.ndarray = np.empty((0, 7), dtype=np.float32)
        self.track_ids: list[str] = []
        self._is_loaded: bool = False

    @property
    def is_loaded(self) -> bool:
        """Return True if dataset and matrix are loaded into memory."""
        return self._is_loaded

    @property
    def count(self) -> int:
        """Return number of tracks stored in memory."""
        return len(self.df)

    def load_from_dataframe(self, df: pd.DataFrame) -> None:
        """Load dataset from a pandas DataFrame and prepare the vector matrix.

        Args:
            df: DataFrame containing track metadata and 7 audio feature columns.
        """
        for feature in settings.AUDIO_FEATURES_7D:
            if feature not in df.columns:
                raise ValueError(f"Required audio feature column '{feature}' is missing from dataset.")

        self.df = df.copy().reset_index(drop=True)
        self.track_ids = self.df["track_id"].astype(str).tolist()

        # Extract 7D audio features matrix (float32 for speed and compact memory)
        raw_vals = self.df[settings.AUDIO_FEATURES_7D].to_numpy(dtype=np.float32)
        self.raw_matrix = raw_vals

        # L2 Normalize the matrix: v_norm = v / ||v||_2
        norms = np.linalg.norm(raw_vals, axis=1, keepdims=True)
        # Avoid division by zero with small epsilon
        norms[norms == 0.0] = 1e-9
        self.normalized_matrix = raw_vals / norms
        self._is_loaded = True

        logger.info(
            "VectorStore initialized with %d tracks. Matrix shape: %s",
            len(self.df),
            self.normalized_matrix.shape,
        )

    def load_from_csv(self, file_path: Path | str) -> None:
        """Load cleaned dataset from CSV file.

        Args:
            file_path: Path to the cleaned CSV file.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Cleaned dataset CSV not found at: {path}")

        logger.info("Loading cleaned dataset from %s ...", path)
        df = pd.read_csv(path)
        self.load_from_dataframe(df)

    def search(
        self,
        target_vector: Sequence[float] | np.ndarray,
        limit: int = 15,
        exclude_ids: set[str] | list[str] | None = None,
    ) -> list[RecommendedTrack]:
        """Search top K nearest tracks using cosine similarity.

        Args:
            target_vector: 7D float array/list representing desired audio features.
            limit: Maximum number of tracks to return.
            exclude_ids: Optional set/list of track IDs to ignore (e.g. for refinement).

        Returns:
            List of RecommendedTrack models sorted descending by similarity.
        """
        if not self._is_loaded or len(self.df) == 0:
            raise RuntimeError("VectorStore is empty or not loaded yet.")

        target = np.asarray(target_vector, dtype=np.float32).reshape(-1)
        if target.shape[0] != 7:
            raise ValueError(f"Target vector must have exactly 7 dimensions, got {target.shape[0]}")

        # L2 Normalize query vector
        norm = np.linalg.norm(target)
        if norm == 0.0:
            norm = 1e-9
        normalized_target = target / norm

        # Cosine similarity via dot product with pre-normalized matrix
        # (N, 7) @ (7,) -> (N,)
        similarities = np.dot(self.normalized_matrix, normalized_target)

        # Exclude specified track IDs if provided
        exclude_set = set(exclude_ids) if exclude_ids else set()

        if exclude_set:
            # Mask out excluded tracks with negative infinity
            indices_to_mask = [
                idx for idx, tid in enumerate(self.track_ids) if tid in exclude_set
            ]
            if indices_to_mask:
                similarities = similarities.copy()
                similarities[indices_to_mask] = -1.0

        # Find top candidates
        # Use argpartition for fast top-K retrieval on large collections
        candidate_count = min(limit, len(self.df) - len(exclude_set))
        if candidate_count <= 0:
            return []

        if candidate_count < len(similarities):
            top_indices = np.argpartition(-similarities, candidate_count)[:candidate_count]
            # Sort the partition in descending order
            top_indices = top_indices[np.argsort(-similarities[top_indices])]
        else:
            top_indices = np.argsort(-similarities)[:candidate_count]

        results: list[RecommendedTrack] = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score < 0.0 and idx in exclude_set:
                continue

            row = self.df.iloc[idx]
            track_features = AudioFeatures7D(
                danceability=float(row["danceability"]),
                valence=float(row["valence"]),
                energy=float(row["energy"]),
                acousticness=float(row["acousticness"]),
                instrumentalness=float(row["instrumentalness"]),
                liveness=float(row["liveness"]),
                speechiness=float(row["speechiness"]),
            )

            # Metadata extraction (safe fallbacks for album_name)
            album_name = str(row["album_name"]) if "album_name" in row and pd.notna(row["album_name"]) else None
            genre = str(row["genre"]) if "genre" in row and pd.notna(row["genre"]) else None

            results.append(
                RecommendedTrack(
                    track_id=str(row["track_id"]),
                    title=str(row["track_name"]),
                    artist_name=str(row["artist_name"]),
                    album_name=album_name,
                    genre=genre,
                    popularity=int(row.get("popularity", 0)),
                    similarity_score=round(score, 4),
                    audio_features=track_features,
                )
            )

        return results


# Global singleton instance
vector_store = VectorStore()
